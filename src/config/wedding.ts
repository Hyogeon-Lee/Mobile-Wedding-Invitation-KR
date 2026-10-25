import type { WeddingConfig, GalleryImage } from './types'

/**
 * Schematic draft data. Every "OO" is a placeholder to be replaced.
 * Photos are generated placeholders from `npm run placeholders` (public/images/*.svg).
 */
const img = (i: number, w: number, h: number): GalleryImage => ({
  src: `images/gallery-${String(i).padStart(2, '0')}.svg`,
  width: w,
  height: h,
  alt: `신랑 신부 사진 ${i}`,
})

export const wedding: WeddingConfig = {
  couple: {
    groom: {
      name: '이OO',
      relation: '아들',
      father: { name: '이OO' },
      mother: { name: '김OO' },
    },
    bride: {
      name: '박OO',
      relation: '딸',
      father: { name: '박OO' },
      mother: { name: '최OO' },
    },
  },
  event: {
    // Placeholder instant: 2027-05-15 (Sat) 12:00 KST. Replace when the date is confirmed.
    startsAt: '2027-05-15T12:00:00+09:00',
    datePlaceholder: true,
    venueName: '노블발렌티 삼성',
    hall: 'OO홀',
    // Address from two listing sites (directwedding, weddingcrowd) on 2026-10-25; confirm with the venue.
    address: '서울특별시 강남구 봉은사로 637',
    addressJibun: '삼성동 109-6',
    // Placeholder near Samseong station; replace with the venue pin from Kakao Map.
    coords: { lat: 37.5094, lng: 127.0623, placeholder: true },
  },
  greeting: {
    title: '소중한 분들을 초대합니다',
    body: [
      '서로의 하루를 함께 걷던 두 사람이',
      '이제 같은 길을 걸어가려 합니다.',
      '',
      '저희의 시작을 지켜봐 주시고',
      '따뜻한 마음으로 축복해 주시면',
      '큰 기쁨으로 간직하겠습니다.',
    ].join('\n'),
    quote: {
      text: '사랑은 오래 참고 사랑은 온유하며',
      source: '고린도전서 13:4',
    },
  },
  cover: {
    image: { src: 'images/cover.svg', width: 1200, height: 1600, alt: '메인 사진' },
    eyebrow: 'WEDDING INVITATION',
  },
  gallery: [
    img(1, 1200, 1500),
    img(2, 1200, 1500),
    img(3, 1200, 900),
    img(4, 1200, 1500),
    img(5, 1200, 1500),
    img(6, 1200, 900),
    img(7, 1200, 1500),
    img(8, 1200, 1500),
    img(9, 1200, 900),
    img(10, 1200, 1500),
    img(11, 1200, 1500),
    img(12, 1200, 900),
  ],
  transport: {
    subway: ['OO호선 OO역 O번 출구에서 도보 O분'],
    bus: ['간선 OOO, 지선 OOOO · OO정류장 하차'],
    car: ['내비게이션에 "노블발렌티 삼성" 또는 "봉은사로 637" 입력'],
    parking: ['건물 내 주차 O시간 무료 (안내데스크 등록)'],
  },
  sections: {
    cover: true,
    greeting: true,
    family: true,
    calendar: true,
    gallery: true,
    location: true,
    account: true,
    rsvp: true,
    guestbook: true,
    share: true,
    footer: true,
  },
  share: {
    title: '이OO ♥ 박OO 결혼합니다',
    description: '2027년 OO월 OO일 · 노블발렌티 삼성',
    imagePath: 'og-image.png',
    buttonLabel: '카카오톡으로 공유하기',
  },
  footer: {
    credit: '이OO · 박OO 2027',
  },
}

export default wedding
