/** Detects the KakaoTalk in-app browser (used to pick clipboard/share fallbacks). */
export function isKakaoTalkInApp(): boolean {
  return /KAKAOTALK/i.test(navigator.userAgent)
}

export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

/** Resolve a path under public/ against Vite's base URL. */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`
  return `${base}${path.replace(/^\//, '')}`
}
