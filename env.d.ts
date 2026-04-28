/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_R2_PUBLIC_URL: string
  readonly VITE_R2_LIST_ENDPOINT: string
  readonly VITE_SPOTIFY_CLIENT_ID: string | undefined
  readonly VITE_SPOTIFY_CLIENT_SECRET: string | undefined
  readonly VITE_SPOTIFY_REFRESH_TOKEN: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
