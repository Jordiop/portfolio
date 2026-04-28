import { ref, onMounted, onUnmounted } from 'vue'

export interface SpotifyTrack {
  title: string
  artist: string
  album: string
  albumArt: string
  spotifyUrl: string
  isPlaying: boolean
  progressMs: number
  durationMs: number
  progress: number
}

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET as string | undefined
const REFRESH_TOKEN = import.meta.env.VITE_SPOTIFY_REFRESH_TOKEN as string | undefined

async function getAccessToken(): Promise<string | null> {
  const basic = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: REFRESH_TOKEN!,
    }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return (data.access_token as string) ?? null
}

async function fetchCurrentlyPlaying(token: string): Promise<SpotifyTrack | null> {
  const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (res.status === 204) return null
  if (!res.ok) return null

  const data = await res.json()
  if (!data?.item) return null

  const item = data.item
  const progressMs: number = data.progress_ms ?? 0
  const durationMs: number = item.duration_ms

  return {
    title: item.name,
    artist: item.artists.map((a: { name: string }) => a.name).join(', '),
    album: item.album.name,
    albumArt: (item.album.images[0]?.url as string) ?? '',
    spotifyUrl: item.external_urls.spotify as string,
    isPlaying: data.is_playing as boolean,
    progressMs,
    durationMs,
    progress: durationMs > 0 ? Math.round((progressMs / durationMs) * 100) : 0,
  }
}

export function useSpotifyNowPlaying() {
  const configured = !!(CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN)
  const track = ref<SpotifyTrack | null>(null)
  const loading = ref(true)
  const error = ref(false)

  let interval: ReturnType<typeof setInterval> | null = null

  async function refresh() {
    if (!configured) { loading.value = false; return }
    try {
      const token = await getAccessToken()
      if (!token) { error.value = true; loading.value = false; return }
      track.value = await fetchCurrentlyPlaying(token)
      error.value = false
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    refresh()
    interval = setInterval(refresh, 30_000)
  })

  onUnmounted(() => {
    if (interval) clearInterval(interval)
  })

  return { track, loading, error, configured }
}
