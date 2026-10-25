/**
 * Pure URL builders for the three navigation apps. Coordinates are WGS84 (lat, lng).
 * Kakao is a web link usable everywhere; Naver and T map are app schemes that need
 * a fallback when the app is missing (see openApp.ts).
 */
export interface Place {
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

/** "example.com" from "https://example.com/path"; "" when the input is not a URL. */
export function hostOf(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return ''
  }
}
