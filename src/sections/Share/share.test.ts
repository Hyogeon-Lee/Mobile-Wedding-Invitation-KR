import { describe, expect, it } from 'vitest'
import { KAKAO_BUTTON_TITLE, fallbackCopyMessage, isShareAbort, kakaoFeedPayload, shareImageUrl } from './share'

describe('shareImageUrl', () => {
  it('joins the site URL and the public path with exactly one slash', () => {
    expect(shareImageUrl('https://example.github.io/repo', 'og-image.png')).toBe(
      'https://example.github.io/repo/og-image.png',
    )
  })
  it('tolerates a trailing slash on the site and a leading slash on the path', () => {
    expect(shareImageUrl('https://example.com/', '/og-image.png')).toBe('https://example.com/og-image.png')
  })
})

describe('kakaoFeedPayload', () => {
  const content = {
    title: '이OO ♥ 박OO 결혼합니다',
    description: '2027년 OO월 OO일 · 노블발렌티 삼성',
    imageUrl: 'https://example.com/og-image.png',
    url: 'https://example.com',
  }
  const payload = kakaoFeedPayload(content)

  it('uses the feed template with the title, description and image', () => {
    expect(payload.objectType).toBe('feed')
    expect(payload.content.title).toBe(content.title)
    expect(payload.content.description).toBe(content.description)
    expect(payload.content.imageUrl).toBe(content.imageUrl)
  })
  it('points both the card and the single button at the site URL', () => {
    const link = { mobileWebUrl: content.url, webUrl: content.url }
    expect(payload.content.link).toEqual(link)
    expect(payload.buttons).toEqual([{ title: KAKAO_BUTTON_TITLE, link }])
  })
})

describe('fallbackCopyMessage', () => {
  it('explains the missing key when none is configured', () => {
    expect(fallbackCopyMessage(false)).toBe('카카오 API 키가 없어 링크를 복사했습니다')
  })
  it('reports a load failure when a key exists', () => {
    expect(fallbackCopyMessage(true)).toContain('불러오지 못해')
  })
})

describe('isShareAbort', () => {
  it('recognises an AbortError-shaped rejection', () => {
    expect(isShareAbort({ name: 'AbortError' })).toBe(true)
  })
  it('rejects other errors and non-objects', () => {
    expect(isShareAbort(new Error('boom'))).toBe(false)
    expect(isShareAbort(null)).toBe(false)
    expect(isShareAbort('AbortError')).toBe(false)
  })
})
