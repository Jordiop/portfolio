import { ref } from 'vue'

export interface GalleryPhoto {
    key: string
    url: string
    caption: string
}

export interface ExifData {
    camera: string | null
    iso: string | null
    focalLength: string | null
    aperture: string | null
    exposureTime: string | null
    dateTaken: string | null
}

const R2_BASE_URL = (import.meta.env.VITE_R2_PUBLIC_URL as string) || ''
const R2_LIST_URL = (import.meta.env.VITE_R2_LIST_ENDPOINT as string) || ''
const R2_EXIF_BASE_URL = R2_LIST_URL.replace(/\/list$/, '')

// Module-level singletons — shared across all useGallery() calls
const photos = ref<GalleryPhoto[]>([])
const isLoading = ref(false)
const error = ref('')

const exifCache = new Map<string, ExifData>()
const exifPending = new Set<string>()

function keyToCaption(key: string): string {
    return (key.split('/').pop() ?? key)
        .replace(/\.[^.]+$/, '')
        .replace(/[-_]/g, ' ')
}

export function useGallery() {
    const fetchPhotos = async () => {
        if (photos.value.length) return

        if (!R2_LIST_URL) {
            error.value = 'Set VITE_R2_LIST_ENDPOINT in your .env file.'
            return
        }

        isLoading.value = true
        error.value = ''

        try {
            const res = await fetch(R2_LIST_URL)
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data: { objects: { key: string }[] } = await res.json()
            photos.value = data.objects
                .filter(o => /\.(jpe?g|png|webp|avif|gif)$/i.test(o.key))
                .map(o => ({
                    key: o.key,
                    url: `${R2_BASE_URL}/${o.key}`,
                    caption: keyToCaption(o.key),
                }))
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Failed to load photos'
        } finally {
            isLoading.value = false
        }
    }

    const fetchExif = async (key: string): Promise<void> => {
        if (exifCache.has(key) || exifPending.has(key) || !R2_EXIF_BASE_URL) return

        exifPending.add(key)
        try {
            const res = await fetch(`${R2_EXIF_BASE_URL}/exif/${encodeURIComponent(key)}`)
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            exifCache.set(key, await res.json())
        } finally {
            exifPending.delete(key)
        }
    }

    const getExif = (key: string): ExifData | null => exifCache.get(key) ?? null
    const isExifLoading = (key: string): boolean => exifPending.has(key)

    return { photos, isLoading, error, fetchPhotos, fetchExif, getExif, isExifLoading }
}
