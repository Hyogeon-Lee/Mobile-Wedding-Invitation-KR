import { describe, expect, it } from 'vitest'
import { hostOf, kakaoNaviUrl, naverAppUrl, naverWebUrl, tmapUrl } from './links'

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
