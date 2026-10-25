/**
 * Kakao JavaScript SDK loader for KakaoTalk share. The map uses react-kakao-maps-sdk,
 * which loads its own script; both share the same JavaScript key (VITE_KAKAO_JS_KEY).
 */
const SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js'

let loading: Promise<boolean> | null = null

export const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY ?? ''

export function loadKakaoSdk(): Promise<boolean> {
  if (!kakaoKey) return Promise.resolve(false)
  if (window.Kakao?.isInitialized?.()) return Promise.resolve(true)
  if (loading) return loading
  loading = new Promise<boolean>((resolve) => {
    const s = document.createElement('script')
    s.src = SDK_URL
    s.async = true
    s.onload = () => {
      try {
        if (window.Kakao && !window.Kakao.isInitialized()) window.Kakao.init(kakaoKey)
        resolve(Boolean(window.Kakao?.isInitialized()))
      } catch {
        resolve(false)
      }
    }
    s.onerror = () => resolve(false)
    document.head.appendChild(s)
  })
  return loading
}

/** Absolute site URL for share links; falls back to the current origin + base. */
export function siteUrl(): string {
  const env = import.meta.env.VITE_SITE_URL
  if (env) return env.replace(/\/$/, '')
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  return `${window.location.origin}${base}`
}
