export interface Env {
    PHOTOS_BUCKET: R2Bucket
    ALLOWED_ORIGIN: string
}

// ── Minimal JPEG EXIF parser ──────────────────────────────────────────────────
// Reads JPEG APP1/TIFF structure and extracts the tags we care about.
// Handles both little-endian and big-endian TIFF byte orders.

const TAG = {
    Make: 0x010f,
    Model: 0x0110,
    ExposureTime: 0x829a,
    FNumber: 0x829d,
    ISO: 0x8827,
    DateTimeOriginal: 0x9003,
    FocalLength: 0x920a,
} as const

type TagName = keyof typeof TAG

interface RawExif {
    Make?: string
    Model?: string
    ISO?: number
    FocalLength?: number
    FNumber?: number
    ExposureTime?: number
    DateTimeOriginal?: string
}

function readUint16(view: DataView, offset: number, le: boolean) {
    return view.getUint16(offset, le)
}
function readUint32(view: DataView, offset: number, le: boolean) {
    return view.getUint32(offset, le)
}

function readRational(view: DataView, offset: number, le: boolean): number {
    const num = readUint32(view, offset, le)
    const den = readUint32(view, offset + 4, le)
    return den === 0 ? 0 : num / den
}

function readAscii(view: DataView, offset: number, count: number): string {
    let str = ''
    for (let i = 0; i < count - 1; i++) {
        const c = view.getUint8(offset + i)
        if (c === 0) break
        str += String.fromCharCode(c)
    }
    return str.trim()
}

function readIFD(view: DataView, ifdOffset: number, tiffBase: number, le: boolean, tags: Set<number>): RawExif {
    const result: RawExif = {}
    const count = readUint16(view, ifdOffset, le)

    for (let i = 0; i < count; i++) {
        const entry = ifdOffset + 2 + i * 12
        if (entry + 12 > view.byteLength) break

        const tag = readUint16(view, entry, le)
        if (!tags.has(tag)) continue

        const type = readUint16(view, entry + 2, le)
        const num = readUint32(view, entry + 4, le)
        const valOffset = entry + 8

        // type 2 = ASCII
        if (type === 2) {
            const dataOffset = num > 4 ? tiffBase + readUint32(view, valOffset, le) : valOffset
            if (dataOffset + num <= view.byteLength) {
                const str = readAscii(view, dataOffset, num)
                if (tag === TAG.Make) result.Make = str
                else if (tag === TAG.Model) result.Model = str
                else if (tag === TAG.DateTimeOriginal) result.DateTimeOriginal = str
            }
        }
        // type 3 = SHORT (uint16)
        else if (type === 3) {
            const val = readUint16(view, valOffset, le)
            if (tag === TAG.ISO) result.ISO = val
        }
        // type 5 = RATIONAL (two uint32s)
        else if (type === 5) {
            const dataOffset = tiffBase + readUint32(view, valOffset, le)
            if (dataOffset + 8 <= view.byteLength) {
                const val = readRational(view, dataOffset, le)
                if (tag === TAG.ExposureTime) result.ExposureTime = val
                else if (tag === TAG.FNumber) result.FNumber = val
                else if (tag === TAG.FocalLength) result.FocalLength = val
            }
        }
    }
    return result
}

function parseExif(buffer: ArrayBuffer): RawExif {
    const view = new DataView(buffer)
    const len = view.byteLength

    // Find JPEG APP1 marker (0xFFE1)
    let pos = 2 // skip SOI (0xFFD8)
    while (pos + 4 < len) {
        const marker = view.getUint16(pos)
        const segLen = view.getUint16(pos + 2)
        if (marker === 0xffe1) break
        if (marker === 0xffda) return {} // SOS — no more metadata
        pos += 2 + segLen
    }
    if (pos + 4 >= len) return {}

    // APP1 payload starts at pos+4, check for "Exif\0\0"
    const exifStart = pos + 4
    if (exifStart + 6 > len) return {}
    const magic = String.fromCharCode(
        view.getUint8(exifStart), view.getUint8(exifStart + 1),
        view.getUint8(exifStart + 2), view.getUint8(exifStart + 3),
    )
    if (magic !== 'Exif') return {}

    // TIFF header starts 6 bytes into APP1 payload
    const tiffBase = exifStart + 6
    if (tiffBase + 8 > len) return {}

    const byteOrder = view.getUint16(tiffBase)
    const le = byteOrder === 0x4949 // "II" = little-endian, "MM" = big-endian

    const ifd0Offset = tiffBase + readUint32(view, tiffBase + 4, le)
    if (ifd0Offset + 2 > len) return {}

    const wantedTags = new Set(Object.values(TAG))
    const ifd0 = readIFD(view, ifd0Offset, tiffBase, le, wantedTags)

    // Find ExifIFD sub-IFD (tag 0x8769) for exposure/focal/ISO/date
    const ifd0Count = readUint16(view, ifd0Offset, le)
    for (let i = 0; i < ifd0Count; i++) {
        const entry = ifd0Offset + 2 + i * 12
        if (entry + 12 > len) break
        const tag = readUint16(view, entry, le)
        if (tag === 0x8769) { // ExifIFD pointer
            const subOffset = tiffBase + readUint32(view, entry + 8, le)
            if (subOffset + 2 <= len) {
                const sub = readIFD(view, subOffset, tiffBase, le, wantedTags)
                Object.assign(ifd0, sub)
            }
            break
        }
    }

    return ifd0
}

// ── EXIF formatting ───────────────────────────────────────────────────────────

export interface ExifData {
    camera: string | null
    iso: string | null
    focalLength: string | null
    aperture: string | null
    exposureTime: string | null
    dateTaken: string | null
}

function formatExif(raw: RawExif): ExifData {
    let camera: string | null = null
    if (raw.Make || raw.Model) {
        const make = raw.Make?.trim() ?? ''
        const model = raw.Model?.trim() ?? ''
        camera = model.toLowerCase().startsWith(make.toLowerCase())
            ? model
            : [make, model].filter(Boolean).join(' ')
    }

    const iso = raw.ISO != null ? `ISO\u00a0${raw.ISO}` : null

    const focalLength = raw.FocalLength != null
        ? `${Math.round(raw.FocalLength)}mm`
        : null

    let aperture: string | null = null
    if (raw.FNumber != null && raw.FNumber > 0) {
        const f = raw.FNumber
        aperture = `f/${f % 1 === 0 ? f.toFixed(0) : f.toFixed(1)}`
    }

    let exposureTime: string | null = null
    if (raw.ExposureTime != null && raw.ExposureTime > 0) {
        const t = raw.ExposureTime
        exposureTime = t >= 1 ? `${t}s` : `1/${Math.round(1 / t)}s`
    }

    // EXIF DateTimeOriginal format: "YYYY:MM:DD HH:MM:SS"
    let dateTaken: string | null = null
    if (raw.DateTimeOriginal) {
        dateTaken = raw.DateTimeOriginal.slice(0, 10).replace(/:/g, '-')
    }

    return { camera, iso, focalLength, aperture, exposureTime, dateTaken }
}

// ── CORS helpers ──────────────────────────────────────────────────────────────

const isAllowed = (origin: string, allowed: string) =>
    allowed === '*' ||
    origin === allowed ||
    /^https?:\/\/localhost(:\d+)?$/.test(origin)

const corsHeaders = (origin: string, allowed: string) => ({
    'Access-Control-Allow-Origin': isAllowed(origin, allowed) ? origin : allowed,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
})

// ── Worker ────────────────────────────────────────────────────────────────────

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url)
        const origin = request.headers.get('Origin') ?? ''
        const allowed = env.ALLOWED_ORIGIN ?? '*'
        const headers = corsHeaders(origin, allowed)

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers })
        }
        if (request.method !== 'GET') {
            return new Response('Method Not Allowed', { status: 405, headers })
        }

        // GET /list
        if (url.pathname === '/list') {
            const objects: { key: string; size: number; uploaded: string }[] = []
            let cursor: string | undefined
            do {
                const result = await env.PHOTOS_BUCKET.list({ cursor, limit: 1000 })
                for (const obj of result.objects) {
                    objects.push({ key: obj.key, size: obj.size, uploaded: obj.uploaded.toISOString() })
                }
                cursor = result.truncated ? result.cursor : undefined
            } while (cursor)

            return Response.json(
                { objects },
                { headers: { ...headers, 'Cache-Control': 'public, max-age=60' } },
            )
        }

        // GET /exif/:key
        const exifMatch = url.pathname.match(/^\/exif\/(.+)$/)
        if (exifMatch) {
            const key = decodeURIComponent(exifMatch[1])
            const object = await env.PHOTOS_BUCKET.get(key)
            if (!object) return new Response('Not Found', { status: 404, headers })

            const buffer = await object.arrayBuffer()
            let exif: ExifData = { camera: null, iso: null, focalLength: null, aperture: null, exposureTime: null, dateTaken: null }
            try {
                exif = formatExif(parseExif(buffer))
            } catch { /* unreadable EXIF — return all-null */ }

            return Response.json(exif, {
                headers: { ...headers, 'Cache-Control': 'public, max-age=31536000, immutable' },
            })
        }

        return new Response('Not Found', { status: 404, headers })
    },
}
