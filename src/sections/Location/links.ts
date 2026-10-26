/**
 * Pure URL builders for the three navigation apps. Coordinates are WGS84 (lat, lng).
 * Naver and T map are app schemes that need a fallback when the app is missing:
 * an Android intent URL on Android, openApp.ts elsewhere.
 */
interface Place {
  name: string
  lat: number
  lng: number
}

/** Kakao Map route-to page: works in a browser and hands off to the app when installed. */
export function kakaoNaviUrl({ name, lat, lng }: Place): string {
  return `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`
}

/**
 * Naver Map public-transit route scheme. `appName` identifies the caller
 * (the site host) so the app can offer a way back.
 */
export function naverAppUrl({ name, lat, lng }: Place, appName: string): string {
  return `nmap://route/public?dlat=${lat}&dlng=${lng}&dname=${encodeURIComponent(name)}&appname=${encodeURIComponent(appName)}`
}

/** Naver Map web search by address, used when the app scheme does not open. */
export function naverWebUrl(address: string): string {
  return `https://map.naver.com/p/search/${encodeURIComponent(address)}`
}

/** T map route scheme (app only; goalx is longitude, goaly is latitude). */
export function tmapUrl({ name, lat, lng }: Place): string {
  return `tmap://route?goalname=${encodeURIComponent(name)}&goaly=${lat}&goalx=${lng}`
}

export const NAVER_MAP_PACKAGE = 'com.nhn.android.nmap'
export const TMAP_PACKAGE = 'com.skt.tmap.ku'
export const TMAP_STORE_URL = `https://play.google.com/store/apps/details?id=${TMAP_PACKAGE}`

/**
 * Rewrites `scheme://rest` as an Android intent URL. Chrome and Android WebViews open the
 * app when installed and otherwise load `fallbackUrl`, with no timer on the page side.
 */
export function androidIntentUrl(schemeUrl: string, pkg: string, fallbackUrl: string): string {
  const sep = schemeUrl.indexOf('://')
  const scheme = schemeUrl.slice(0, sep)
  const rest = schemeUrl.slice(sep + 3)
  return (
    `intent://${rest}#Intent;scheme=${scheme};action=android.intent.action.VIEW;` +
    `category=android.intent.category.BROWSABLE;package=${pkg};` +
    `S.browser_fallback_url=${encodeURIComponent(fallbackUrl)};end`
  )
}

export function isAndroidUserAgent(ua: string): boolean {
  return /Android/i.test(ua)
}

/** Host of a URL, or "" when the input is not a URL */
export function hostOf(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return ''
  }
}
