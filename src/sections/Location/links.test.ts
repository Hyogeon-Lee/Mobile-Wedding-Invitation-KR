import { describe, expect, it } from 'vitest'
import {
  androidIntentUrl,
  hostOf,
  isAndroidUserAgent,
  kakaoNaviUrl,
  NAVER_MAP_PACKAGE,
  naverAppUrl,
  naverWebUrl,
  TMAP_PACKAGE,
  TMAP_STORE_URL,
  tmapUrl,
} from './links'

const place = { name: '노블발렌티 삼성', lat: 37.5094, lng: 127.0623 }
const encodedName = encodeURIComponent(place.name)

describe('kakaoNaviUrl', () => {
  it('builds the map.kakao.com route link with an encoded name and lat,lng order', () => {
    expect(kakaoNaviUrl(place)).toBe(`https://map.kakao.com/link/to/${encodedName},37.5094,127.0623`)
  })
})

describe('naverAppUrl', () => {
  it('builds the nmap public route scheme with encoded name and app name', () => {
    expect(naverAppUrl(place, 'example.github.io')).toBe(
      `nmap://route/public?dlat=37.5094&dlng=127.0623&dname=${encodedName}&appname=example.github.io`,
    )
  })
  it('encodes characters in the app name', () => {
    expect(naverAppUrl(place, 'a b&c')).toContain('appname=a%20b%26c')
  })
})

describe('naverWebUrl', () => {
  it('searches the address on map.naver.com', () => {
    const address = '서울특별시 강남구 봉은사로 637'
    expect(naverWebUrl(address)).toBe(`https://map.naver.com/p/search/${encodeURIComponent(address)}`)
  })
})

describe('tmapUrl', () => {
  it('maps lat to goaly and lng to goalx', () => {
    expect(tmapUrl(place)).toBe(`tmap://route?goalname=${encodedName}&goaly=37.5094&goalx=127.0623`)
  })
})

describe('hostOf', () => {
  it('returns the host including a port', () => {
    expect(hostOf('https://example.github.io/repo/')).toBe('example.github.io')
    expect(hostOf('http://localhost:5173')).toBe('localhost:5173')
  })
  it('returns an empty string for a non-URL', () => {
    expect(hostOf('')).toBe('')
    expect(hostOf('not a url')).toBe('')
  })
})

describe('androidIntentUrl', () => {
  it('moves the scheme into the intent fragment and keeps the path and query', () => {
    const fallback = 'https://map.naver.com/p/search/a b'
    expect(androidIntentUrl(naverAppUrl(place, 'example.github.io'), NAVER_MAP_PACKAGE, fallback)).toBe(
      `intent://route/public?dlat=37.5094&dlng=127.0623&dname=${encodedName}&appname=example.github.io` +
        '#Intent;scheme=nmap;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;' +
        `package=com.nhn.android.nmap;S.browser_fallback_url=${encodeURIComponent(fallback)};end`,
    )
  })
  it('builds the T map intent with the Play Store fallback', () => {
    const url = androidIntentUrl(tmapUrl(place), TMAP_PACKAGE, TMAP_STORE_URL)
    expect(url.startsWith(`intent://route?goalname=${encodedName}&goaly=37.5094&goalx=127.0623#Intent;scheme=tmap;`)).toBe(true)
    expect(url).toContain('package=com.skt.tmap.ku;')
    expect(url).toContain(`S.browser_fallback_url=${encodeURIComponent(TMAP_STORE_URL)};end`)
  })
})

describe('isAndroidUserAgent', () => {
  it('detects Android, including the KakaoTalk in-app browser', () => {
    expect(isAndroidUserAgent('Mozilla/5.0 (Linux; Android 14; SM-S918N) AppleWebKit/537.36 KAKAOTALK 10.8.0')).toBe(true)
  })
  it('is false for iOS and desktop', () => {
    expect(isAndroidUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15')).toBe(false)
    expect(isAndroidUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe(false)
  })
})
