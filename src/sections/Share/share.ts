/**
 * Pure builders for the share section. Kept free of `window` so they can be unit-tested
 * in the node environment; the component supplies `siteUrl()` and the config values.
 */

export interface ShareContent {
  title: string
  description: string
  /** Absolute URL of the preview image (Kakao rejects relative paths). */
  imageUrl: string
  /** Absolute URL the card and its button link to. */
  url: string
}

type KakaoLink = { mobileWebUrl: string; webUrl: string }

/** Settings object for `Kakao.Share.sendDefault` (feed template). */
export type KakaoFeedSettings = {
  objectType: 'feed'
  content: { title: string; description: string; imageUrl: string; link: KakaoLink }
  buttons: { title: string; link: KakaoLink }[]
}

export const KAKAO_BUTTON_TITLE = '청첩장 보기'

/** "https://host/base/og-image.png" from a site URL and a path under public/, whatever the slashes. */
export function shareImageUrl(site: string, imagePath: string): string {
  return `${site.replace(/\/+$/, '')}/${imagePath.replace(/^\/+/, '')}`
}

export function kakaoFeedPayload({ title, description, imageUrl, url }: ShareContent): KakaoFeedSettings {
  const link: KakaoLink = { mobileWebUrl: url, webUrl: url }
  return {
    objectType: 'feed',
    content: { title, description, imageUrl, link },
    buttons: [{ title: KAKAO_BUTTON_TITLE, link }],
  }
}

/**
 * Toast shown after the link was copied instead of opening KakaoTalk. Distinguishes
 * "no key configured" (expected in preview) from "SDK failed to load" (network/key error).
 */
export function fallbackCopyMessage(hasKey: boolean): string {
  return hasKey ? '카카오톡 공유를 불러오지 못해 링크를 복사했습니다' : '링크를 복사했습니다'
}

/** A user-dismissed native share sheet is not an error and must not fall through to copying. */
export function isShareAbort(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'AbortError'
}
