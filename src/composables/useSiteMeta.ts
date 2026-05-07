const SITE = 'Jordi Osarenkhoe'
const DEFAULT_TITLE = `${SITE} — Full Stack Developer`
const DEFAULT_DESCRIPTION = 'Full Stack Developer specializing in Vue.js, TypeScript, and modern web technologies.'
const ORIGIN = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || 'https://jordiop.com'

export interface SiteMetaInput {
  title?: string
  description?: string
  image?: string
  path?: string
}

export interface SiteMeta {
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogUrl: string
  ogType: 'website'
  twitterCard: 'summary_large_image'
  twitterTitle: string
  twitterDescription: string
  twitterImage: string
}

export function useSiteMeta(input: SiteMetaInput = {}): SiteMeta {
  const title = input.title ? `${input.title} — ${SITE}` : DEFAULT_TITLE
  const description = input.description ?? DEFAULT_DESCRIPTION
  const rawImage = input.image ?? '/favicon.png'
  const image = rawImage.startsWith('http') ? rawImage : `${ORIGIN}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`
  const url = `${ORIGIN}${input.path?.startsWith('/') ? input.path : `/${input.path ?? ''}`}`

  return {
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogUrl: url,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
  }
}
