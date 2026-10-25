# 모바일 청첩장 개발 계획서

- 작성일: 2026-10-25 (v0.2: 4.4 저장소를 Apps Script로, 4.5 배포를 GitHub Actions로 확정)
- 상태: 초안 — 결정 필요 사항(11장) 확정 후 v1.0으로 갱신
- 대상 저장소: `Hyogeon-Lee/Mobile-Wedding-Invitation-KR`

## 1. 목표와 원칙

### 1.1 목표

정형화된 템플릿이 아닌, 두 사람의 이야기와 취향이 드러나는 모바일 청첩장을 직접 개발한다.
링크 하나로 카카오톡, 문자, 이메일을 통해 전달하며 Android, iOS, 데스크톱 브라우저에서 동일하게 동작해야 한다.

### 1.2 원칙

1. 정보 구성은 검증된 오픈소스 청첩장의 공통 섹션을 따른다. 하객이 기대하는 정보가 빠지면 안 된다.
2. 디자인과 모션은 GitHub에서 널리 쓰이는 오픈소스 라이브러리로 구현하되, 라이브러리 수는 최소로 유지한다.
3. 모바일 우선. 카카오톡 인앱 브라우저를 1순위 대상 환경으로 본다.
4. 서버를 두지 않는 정적 사이트로 만든다. 방명록·참석 여부처럼 저장이 필요한 기능만 외부 무료 서비스에 위임한다.
5. 공개 저장소에 개인정보(전화번호, 계좌번호, 원본 사진)를 커밋하지 않는다.
6. 접근성을 지킨다. 연로한 하객을 위해 글자 크기, 명도 대비, 모션 축소 옵션을 제공한다.

## 2. 참고 오픈소스 조사 결과

조사일 2026-10-25, GitHub 저장소 페이지 기준. Star 수는 조사 시점 값이다.

| 저장소 | Stars | 스택 | 특징 | 라이선스 |
|---|---|---|---|---|
| [heejin-hwang/mobile-wedding-invitation](https://github.com/heejin-hwang/mobile-wedding-invitation) | 441 | React, TypeScript, Vite, Emotion | 카카오맵(react-kakao-maps-sdk), PhotoSwipe 갤러리, 컨페티, Firebase 방명록·좋아요(선택), 카카오페이·토스 송금 링크, Vercel 배포, `src/data.json` 단일 설정 | MIT |
| [S-jooyoung/WEDDING_INVITATION](https://github.com/S-jooyoung/WEDDING_INVITATION) | 115 | Gatsby 5, React 18, TypeScript 5 | 카카오맵 임베드, 스와이프 갤러리, 계좌 복사, 카카오톡 공유, 배경음악 토글, OG 미리보기, 이미지 WebP 변환·폰트 서브셋 스크립트, `src/data/invitation.ts` 단일 설정, 명도 대비 4.5:1 요구 | MIT |
| [juhonamnam/wedding-invitation](https://github.com/juhonamnam/wedding-invitation) | 70 (Fork 114) | React, TypeScript, Vite, SASS | 네이버 지도, 카카오톡 공유, 방명록·참석 여부(별도 서버, `VITE_STATIC_ONLY`로 생략 가능), GitHub Actions → GitHub Pages 배포, rem 단위 스케일링 | MIT |
| [gpjeong/wedding](https://github.com/gpjeong/wedding) | 0 | React 19, Vite 7, Tailwind 4, Framer Motion | 섹션 구성이 가장 완전함(표지·인사말·혼주(고인 표기)·달력 D-day·갤러리·지도·네비 링크 3종·계좌 아코디언·RSVP·방명록·공유·푸터·BGM·낙엽 파티클), Firestore + Google Sheets 동기화, `site:down`/`site:up` 스크립트 | MIT |
| [TennisRitchie/mobile-wedding-invitation](https://github.com/TennisRitchie/mobile-wedding-invitation) | 0 | Next.js 15, TypeScript, Tailwind, GSAP | GSAP ScrollTrigger 기반 스크롤 애니메이션, 스무스 스크롤, 교통편 안내 섹션 | MIT |
| [coderwin/mobile-wedding-invitation](https://github.com/coderwin/mobile-wedding-invitation) | 0 | Next.js, TypeScript | 연락처·계좌번호를 환경 변수로 분리, 검색 엔진 색인 기본 차단, 인앱 브라우저용 클립보드 폴백 | 미확인 |
| [HyunIm/wedding-invitation](https://github.com/HyunIm/wedding-invitation) | 0 | HTML, JavaScript (`config.js`) | 큰 글씨 보기, 퀵 메뉴, 키보드 조작 다이얼로그, 색 테마 6종·폰트 3종, Google Apps Script로 방명록·RSVP, 섹션별 `enabled` 플래그 | MIT |

조사에서 확인된 공통점은 다음과 같다.

- 설정 파일 하나(`data.json`, `invitation.ts`, `wedding.ts`, `config.js`)에 모든 내용을 모은다.
- 지도는 카카오맵 또는 네이버 지도, 공유는 카카오 JavaScript SDK를 쓴다. 둘 다 개발자 콘솔에서 키 발급과 도메인 등록이 필요하다.
- 방명록·참석 여부는 Firebase, Google Sheets(Apps Script), 별도 서버 중 하나에 저장한다.
- 배포는 GitHub Pages, Vercel, Netlify 중 하나이며 모두 무료 범위에서 운영한다.
- 여러 저장소가 공개 저장소에 개인정보를 올리지 말라고 경고한다. 한 번 커밋되면 git 이력에 남는다.

## 3. 포함 정보(섹션) 정의

2장의 교집합에서 도출했다. "필수"는 하객이 반드시 찾는 정보, "선택"은 두 사람의 취향으로 결정할 항목이다.

| # | 섹션 | 구분 | 내용 | 비고 |
|---|---|---|---|---|
| 1 | 표지(Cover) | 필수 | 메인 사진 또는 영상, 두 사람 이름, 예식 일시, 장소 | 첫 화면 로딩 속도가 전체 인상을 결정 |
| 2 | 인사말 | 필수 | 초대 문구, 시 구절(선택) | |
| 3 | 혼주·가족 소개 | 필수 | 양가 부모 성함(고인 표기 지원), 신랑·신부 관계 표기 | |
| 4 | 연락처 | 필수 | 신랑·신부·혼주 전화, 문자 버튼 | `tel:` `sms:` 링크 |
| 5 | 예식 일시·달력·D-day | 필수 | 월간 달력에 예식일 강조, 남은 일수 | 브라우저 시각 기준 KST 계산 |
| 6 | 갤러리 | 필수 | 그리드 또는 슬라이더, 확대 보기, 스와이프 | 권장 10~30장, 장당 1,000~1,600px |
| 7 | 오시는 길 | 필수 | 지도, 주소 복사, 네비 앱 연결(카카오내비·네이버지도·티맵), 대중교통·주차 안내 | 지도 로딩 실패 시 정적 이미지 폴백 |
| 8 | 마음 전하실 곳(계좌) | 필수 | 양가별 아코디언, 계좌번호 복사, 카카오페이·토스 송금 링크(선택) | 계좌는 빌드 시 환경 변수에서 주입 |
| 9 | 공유 | 필수 | 카카오톡 공유, 링크 복사 | 인앱 브라우저 클립보드 폴백 |
| 10 | 메타·OG | 필수 | 제목, 설명, 썸네일, 검색 엔진 색인 차단 | 카카오톡 썸네일 캐시 대응(10장) |
| 11 | 참석 여부(RSVP) | 선택 | 성함, 인원, 식사 여부 | 저장소 필요(Firestore 또는 Sheets) |
| 12 | 방명록 | 선택 | 이름, 메시지, 작성 시각, 삭제용 비밀번호 | 저장소 필요, 스팸 대책 |
| 13 | 배경음악 | 선택 | 토글 버튼, 기본 꺼짐 | iOS는 사용자 제스처 없이 소리 재생 불가 |
| 14 | 푸터 | 필수 | 저작권, 사진 출처, 제작자 | |
| 15 | 개성 요소 | 선택 | 두 사람의 이야기 타임라인, 인터뷰 Q&A, 퀴즈, 하객 사진 업로드, 식전 영상 | "나만의 청첩장"을 만드는 핵심 구간 |

## 4. 기술 스택 선정

### 4.1 프레임워크

**결정: Vite + React 19 + TypeScript, 스타일은 Tailwind CSS v4 + CSS 변수 토큰.**

근거:

- 서버 렌더링이 필요 없다. 청첩장은 내용이 고정된 단일 페이지이고, OG 메타 태그는 `index.html`에 정적으로 둔다(메신저 크롤러가 JavaScript를 실행하지 않는다고 가정하는 것이 안전하다).
- 참고 오픈소스 대부분이 같은 조합이라 문제 해결 사례가 많다.
- 빌드 결과가 정적 파일이므로 GitHub Pages, Vercel, Netlify 어디든 올릴 수 있다.
- Next.js는 OG 이미지 동적 생성 등 추가 기능이 필요할 때만 고려한다. 현재 요구사항에는 과하다.

### 4.2 디자인·모션 라이브러리

조사일 2026-10-25, GitHub 저장소 페이지 기준.

| 라이브러리 | Stars | 라이선스 | 용도 | 채택 |
|---|---|---|---|---|
| [Motion](https://github.com/motiondivision/motion) (구 Framer Motion, npm `motion`) | 34.5k | MIT | 섹션 진입 페이드·슬라이드, 제스처, 레이아웃 전환 | 핵심 |
| [Lenis](https://github.com/darkroomengineering/lenis) (`lenis/react`) | 16.9k | MIT | 스무스 스크롤 | 핵심 |
| [Swiper](https://github.com/nolimits4web/swiper) | 41.9k | MIT | 갤러리 슬라이더, 표지 사진 전환 | 핵심 |
| [PhotoSwipe](https://github.com/dimsemenov/PhotoSwipe) | 25.3k | MIT | 갤러리 확대 보기(핀치 줌, 스와이프 닫기) | 핵심 |
| [canvas-confetti](https://github.com/catdad/canvas-confetti) | 12.8k | ISC | 표지 또는 축하 버튼 연출 | 핵심 |
| [GSAP](https://github.com/greensock/GSAP) + ScrollTrigger, SplitText | 29.7k | GreenSock 무료 표준 라이선스(OSI 라이선스 아님, 상업 이용 포함 무료라고 명시) | 스크롤 연동 스토리텔링(이야기 타임라인), 글자 단위 등장 | 선택 |
| [Lottie](https://github.com/airbnb/lottie-web) | 32.3k | MIT | 벡터 아이콘·장식 애니메이션 | 선택 |
| [tsParticles](https://github.com/tsparticles/tsparticles) (`@tsparticles/react`) | 9.0k | MIT | 꽃잎·눈·별 배경 파티클 | 선택 |
| [React Three Fiber](https://github.com/pmndrs/react-three-fiber) | 33.2k | MIT | 3D 표지 | 보류 (저사양 Android 성능 위험) |
| [AOS](https://github.com/michalsnik/aos) | 28.1k | MIT | 스크롤 등장 효과 | 미채택 (Motion으로 대체 가능) |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | 126.5k | MIT | 아코디언, 다이얼로그, 토스트 등 접근성 갖춘 기본 컴포넌트 | 부분 채택 (필요한 컴포넌트만 복사) |
| [Pretendard](https://github.com/orioncactus/pretendard) | 3.6k | SIL OFL | 본문 한글 서체(가변 폰트, jsDelivr 동적 서브셋) | 핵심 |
| [react-kakao-maps-sdk](https://github.com/JaeSeoKim/react-kakao-maps-sdk) | 318 | MIT | 카카오맵 React 래퍼 | 핵심 |

채택 기준: 핵심 5종(Motion, Lenis, Swiper, PhotoSwipe, canvas-confetti)으로 기본 연출을 모두 구현하고, 선택 항목은 15번 개성 요소의 디자인이 확정된 뒤 필요한 것만 추가한다. 초기 JavaScript 번들은 gzip 기준 200KB 이하를 목표로 한다.

대안 메모: 갤러리 확대 보기는 React 전용 [yet-another-react-lightbox](https://github.com/igordanchenko/yet-another-react-lightbox)(1.3k, MIT)도 가능하다. PhotoSwipe를 1안으로 둔 이유는 참고 템플릿(heejin-hwang)에서 검증된 조합이고 프레임워크 독립이라 교체가 쉽기 때문이다.

### 4.3 지도

**결정: 카카오맵 JavaScript SDK(1안), 네비 딥링크 3종 병행, 지도 로딩 실패 시 정적 이미지 폴백.**

검색으로 확인한 정책(공식 문서 페이지는 이 환경에서 직접 열리지 않아 검색 결과 요약 기준이며, 착수 시 재확인 필요):

- 2026-07-21부터 카카오맵 API는 앱 관리 페이지의 [카카오맵] > [사용 설정]을 ON으로 바꾸면 쓸 수 있고, 별도 심사가 없어졌다.
- Web SDK는 JavaScript 키를 쓰며, 도메인은 [플랫폼] > [Web] 아래 JavaScript 키 하위에 등록한다.
- 무료 쿼터는 개발자 계정에서 첫 번째로 카카오맵을 활성화한 앱에만 제공된다. 두 번째 앱부터는 비즈월렛 연결과 유료 설정이 필요하다.
- 네이버 지도(Naver Cloud Platform Maps)는 대표 계정에 한해 무료 이용량을 제공한다. 조건이 더 까다로워 2안으로 둔다.

### 4.4 방명록·참석 여부 저장소

**결정(2026-10-25, 사용자 지시): Google Apps Script + Google Sheets. Firebase는 쓰지 않는다.**

- Apps Script 웹 앱 하나가 방명록 목록 조회(GET)와 방명록 등록·삭제, 참석 여부 등록(POST)을 처리하고 시트 두 장(`guestbook`, `rsvp`)에 기록한다. 코드는 `google-apps-script/Code.gs`에 둔다.
- 정적 사이트에서 CORS 사전 요청 없이 호출하도록 POST 본문을 `text/plain`으로 보낸다. Apps Script 웹 앱은 preflight에 응답하지 않기 때문이다.
- 삭제는 등록 시 입력한 비밀번호의 SHA-256 해시로만 허용한다. 이름 20자, 메시지 300자 상한과 스크립트 락으로 동시 쓰기를 직렬화한다.
- Google 계정 연동은 추후 진행한다. 그 전까지 클라이언트(`src/lib/sheets.ts`)는 `VITE_APPS_SCRIPT_URL`이 비어 있으면 미리보기 모드로 동작해 브라우저 localStorage에만 저장하고 화면에 "미리보기 모드" 표시를 낸다.
- 응답 열람은 시트에서 직접 한다. 별도 관리자 화면은 만들지 않는다.

### 4.5 배포

**결정(2026-10-25, 사용자 지시): GitHub Actions → GitHub Pages.**

- `.github/workflows/deploy.yml`이 `main` 푸시마다 lint, test, build를 거쳐 Pages에 배포한다. 프로젝트 페이지 경로(`/<repo>/`)는 `VITE_BASE`로 주입한다.
- 카카오 키, 연락처·계좌 JSON, Apps Script URL은 GitHub Secrets에 두고 빌드 시에만 읽는다.
- GitHub 무료 계정은 공개 저장소에서만 Pages를 쓸 수 있는 것으로 알고 있으므로(착수 시 확인), 사진 비공개가 필요해지면 Vercel을 대안으로 둔다.
- 사용자 지정 도메인은 선택 사항이다. 카카오톡 공유 시 표시되는 URL의 인상에 영향을 주므로 결정 항목에 포함한다.

### 4.6 이미지·폰트 파이프라인

- 원본 사진은 저장소 밖(별도 비공개 드라이브)에 보관하고, 빌드용으로 최대 변 1,600px WebP(품질 80 내외)로 변환한 파일만 커밋한다. 변환은 `sharp` 기반 스크립트로 자동화한다.
- `loading="lazy"`, 저해상도 블러 플레이스홀더, `srcset`을 적용한다.
- 본문은 Pretendard Variable 동적 서브셋(CDN), 제목용 명조체(Gowun Batang 또는 Nanum Myeongjo, Google Fonts)를 쓴다. 명조체는 사용 글자만 서브셋해 자체 호스팅한다.

## 5. 디자인 방향

"나만의 청첩장"은 섹션 구성이 아니라 다음 세 가지로 결정된다.

1. **콘셉트**: 아래 후보 중 하나를 1단계에서 무드보드와 함께 확정한다.
   - A. 편집 디자인(잡지형): 큰 타이포그래피, 넓은 여백, 흑백 사진 중심
   - B. 사진 이야기(필름형): 스크롤에 따라 사진과 문장이 이어지는 서사형, GSAP ScrollTrigger 활용
   - C. 편지·봉투 열기: 첫 화면에서 봉투를 열면 본문이 나타나는 연출, Motion 레이아웃 전환 활용
   - D. 미니멀 타이포: 장식 없이 서체와 색만으로 구성, 가장 가볍고 빠름
2. **모션 원칙**: 등장 효과는 0.4~0.8초, 이징은 ease-out 계열, 한 화면에 동시에 움직이는 요소는 2개 이하. `prefers-reduced-motion` 설정 시 모든 모션을 끈다. 중급 Android 기기에서 60fps를 유지하지 못하는 효과는 뺀다.
3. **디자인 토큰**: 색(배경, 본문, 강조 2종), 서체 크기 단계(12/14/16/20/28/40px), 간격(4px 배수)을 CSS 변수로 두고 Tailwind 테마에 연결한다. 본문 명도 대비는 4.5:1 이상을 유지한다.

## 6. 아키텍처

### 6.1 디렉터리 구조(안)

```
.
├── docs/                    # 계획서, 결정 기록
├── public/                  # favicon, OG 썸네일, 정적 지도 폴백 이미지, robots.txt
├── scripts/                 # 이미지 변환, 폰트 서브셋
├── src/
│   ├── config/
│   │   └── wedding.ts       # 모든 내용·플래그 (개인정보 제외)
│   ├── sections/            # Cover, Greeting, Family, Calendar, Gallery, Location, Account, Guestbook, Rsvp, Share, Footer
│   ├── components/          # Accordion, Dialog, Toast, CopyButton 등 공용 UI
│   ├── lib/                 # kakao.ts(지도·공유), firestore.ts, date.ts, clipboard.ts
│   ├── styles/              # tokens.css, global.css
│   ├── assets/images/       # 변환된 WebP
│   └── main.tsx
├── .github/workflows/       # build & deploy
├── .env.example
└── index.html               # OG 메타 태그 정적 기술
```

### 6.2 설정 파일 설계

`src/config/wedding.ts`에 내용과 섹션 플래그를 둔다. 아래는 구조 설명용 스케치다.

```ts
export interface WeddingConfig {
  couple: { groom: Person; bride: Person };
  event: { startsAt: string; venueName: string; hall: string; address: string; lat: number; lng: number };
  greeting: { title: string; body: string; quote?: string };
  gallery: { src: string; width: number; height: number; alt: string }[];
  transport: { subway?: string; bus?: string; car?: string; parking?: string };
  sections: Record<SectionId, boolean>;   // 섹션별 표시 여부
  theme: { accent: string; background: string; font: 'pretendard' | 'serif' };
}
```

- `event.startsAt`은 ISO 8601 문자열 하나로 두고 요일, 오전/오후, D-day를 모두 계산한다. D-day는 `Math.ceil((예식일 자정 KST − 현재 KST) / 86,400,000ms)`로 구하고, 브라우저 시간대와 무관하게 KST로 고정한다.
- `sections` 플래그로 미완성 섹션을 숨긴 채 배포할 수 있다.
- 전화번호와 계좌번호는 이 파일에 두지 않고 `VITE_CONTACTS`, `VITE_ACCOUNTS`(JSON 문자열)로 빌드 시 주입한다. 로컬은 `.env.local`, 배포는 GitHub Secrets 또는 Vercel 환경 변수를 쓴다. 주의: 이 값은 빌드 결과물에 포함되므로 하객 누구나 볼 수 있다. 환경 변수 분리의 목적은 git 이력과 검색 엔진에 남지 않게 하는 것이지 열람 차단이 아니다.

### 6.3 외부 연동 요약

| 기능 | 연동 대상 | 필요한 키·설정 |
|---|---|---|
| 지도 | 카카오맵 JavaScript SDK | JavaScript 키, Web 플랫폼 도메인 등록, [카카오맵] 사용 설정 ON |
| 카카오톡 공유 | Kakao JavaScript SDK `Kakao.Share` | 같은 JavaScript 키, 메시지 템플릿(기본 피드) |
| 네비 연결 | 카카오내비, 네이버지도, 티맵 딥링크 | 키 불필요, 위경도 또는 주소 |
| 방명록·RSVP | Google Apps Script 웹 앱 + Google Sheets | 시트 생성, 스크립트 배포(액세스: 모든 사용자), 웹 앱 URL을 `VITE_APPS_SCRIPT_URL`에 설정 |
| 송금 링크 | 카카오페이 송금 코드, 토스 송금 링크 | 각 앱에서 생성한 링크 |

## 7. 비기능 요구사항

### 7.1 대상 환경

| 우선순위 | 환경 |
|---|---|
| 1 | 카카오톡 인앱 브라우저(iOS, Android) |
| 2 | iOS Safari(최신 2개 메이저), Android Chrome, Samsung Internet |
| 3 | 데스크톱 Chrome·Safari·Edge(가운데 모바일 폭 프레임으로 표시) |

### 7.2 성능 목표

- LCP 2.5초 이하(4G 기준), 초기 JavaScript gzip 200KB 이하, 표지 이미지 150KB 이하.
- 갤러리는 화면에 들어올 때만 로딩한다.
- Lighthouse 모바일 성능 90점 이상을 CI에서 확인한다.

### 7.3 호환성·동작 세부

- 배경음악: iOS WebKit은 소리가 있는 미디어의 자동 재생을 사용자 제스처 없이 허용하지 않는다(음소거 영상은 허용). 따라서 기본 꺼짐 상태로 두고 첫 터치 또는 토글 버튼에서만 재생한다. 2016년 정책 문서 기준이며 최신 문서는 착수 시 재확인한다.
- 카카오톡 썸네일 캐시: 카카오톡 서버는 이미지 URL 기준으로 썸네일을 저장하고, 공유 디버거의 초기화는 메타데이터만 지운다. 썸네일을 바꿀 때는 파일명을 바꾸거나 쿼리스트링 버전(`?v=2`)을 붙인다.
- 인앱 브라우저에서 사진 길게 누르기 메뉴는 `user-select: none`, `-webkit-touch-callout: none`, 드래그 금지 스타일로 막는다.
- 카카오톡 공유 실패 사례: 페이지가 `XMLHttpRequest`를 덮어쓰면 SDK가 오동작한다는 보고가 있다. 전역 객체를 수정하는 코드를 두지 않는다.
- 뷰포트는 `100dvh`와 safe-area inset을 쓰고, 주소창 높이 변화에 레이아웃이 흔들리지 않게 한다.
- 검색 엔진 색인은 `robots.txt`와 `<meta name="robots" content="noindex">`로 차단한다.

### 7.4 접근성

- 본문 16px 이상, "큰 글씨" 토글 제공.
- 모든 버튼에 접근 가능한 이름, 다이얼로그 포커스 트랩, 키보드 조작.
- 명도 대비 4.5:1 이상, `prefers-reduced-motion` 준수.

### 7.5 개인정보·운영

- 공개 저장소에는 변환된 사진만 커밋하고 원본은 올리지 않는다. 사진 비공개가 필요하면 저장소를 비공개로 두고 Vercel로 배포한다.
- 예식 후 일정 기간이 지나면 `site:down` 스크립트로 빈 페이지를 배포해 링크를 닫는다(gpjeong 방식).
- Apps Script에서 입력 길이 제한, 비밀번호 해시 검증, 스크립트 락을 적용한다. 시트 자체는 비공개로 둔다.

## 8. 단계별 계획

기간은 주당 5~10시간 작업을 가정한 추정이며 예식일이 확정되면 역산해 조정한다.

| 단계 | 기간 | 산출물 | 완료 기준 |
|---|---|---|---|
| 0. 준비 | 1주 | 11장 결정 사항 확정, 카카오·Firebase 키 발급, 사진·문구 수집 목록 | 결정 기록 `docs/DECISIONS.md` 작성, `.env.example` 항목 확정 |
| 1. 스캐폴딩·배포 파이프라인 | 1주 | Vite+React+TS 프로젝트, Tailwind·토큰, ESLint·Prettier, GitHub Actions 배포, OG 메타 | 빈 표지 페이지가 실제 URL에서 열리고 카카오톡 미리보기가 정상 표시 |
| 2. 필수 섹션 구현 | 2주 | 표지·인사말·혼주·연락처·달력·갤러리·오시는 길(텍스트)·계좌·공유·푸터 | 설정 파일만 바꿔 내용이 교체되고, 3종 환경(7.1 우선순위 1·2)에서 레이아웃 깨짐 없음 |
| 3. 외부 연동 | 1주 | 카카오맵, 네비 딥링크, 카카오톡 공유, 계좌 복사·송금 링크 | 인앱 브라우저에서 공유·복사·지도·네비 호출이 모두 동작 |
| 4. 디자인·모션 고도화 | 2~3주 | 확정 콘셉트 적용, Motion·Lenis·Swiper·PhotoSwipe·confetti 연출, 15번 개성 요소 | 모션 원칙(5장) 준수, 중급 Android에서 프레임 저하 없음, Lighthouse 90 이상 |
| 5. 선택 기능 | 1~2주 | 방명록, RSVP, 배경음악, 큰 글씨 모드 | Firestore 규칙 테스트 통과, iOS에서 음악 토글 동작 |
| 6. QA·공개 | 1주 | 기기 매트릭스 점검표, 성능·접근성 보고, 최종 문구 교정, 공개 | 점검표 전 항목 통과, 양가 검토 완료 |
| 7. 운영 | 예식 후 | RSVP·방명록 내보내기, 사이트 닫기 | 링크 비활성화, 개인정보 삭제 확인 |

단계 1에서 실제 URL 배포를 먼저 끝내는 이유는 카카오톡 미리보기, 인앱 브라우저 동작, 도메인 등록이 모두 실제 URL이 있어야 검증되기 때문이다.

## 9. 품질 보증 방법

- 단위: 날짜·D-day 계산, 클립보드 폴백, 설정 검증 로직을 Vitest로 테스트한다.
- 시각: Playwright 기기 에뮬레이션(iPhone, Galaxy)으로 섹션별 스크린샷을 찍어 PR마다 비교한다.
- 실기기: iOS·Android 각 1대 이상에서 카카오톡 공유 → 인앱 브라우저 열기 → 모든 버튼 동작을 손으로 확인한다. 이 항목은 자동화로 대체할 수 없다.
- 성능: Lighthouse CI를 GitHub Actions에 넣고 임계값 미달 시 경고한다.

## 10. 리스크와 대응

| 리스크 | 영향 | 대응 |
|---|---|---|
| 카카오맵 정책 재변경, 쿼터 초과 | 지도 미표시 | 정적 지도 이미지 폴백과 네비 딥링크로 길찾기 기능은 유지 |
| 카카오톡 썸네일이 바뀌지 않음 | 공유 인상 저하 | 파일명 버전 관리, 공개 전 디버거로 확인 |
| 저사양 Android에서 모션 끊김 | 사용성 저하 | 파티클·3D 미채택, 모션 수 제한, 실기기 검증 |
| 개인정보 커밋 | 영구 노출 | 환경 변수 분리, pre-commit에서 전화·계좌 패턴 검사, 원본 사진 저장소 외 보관 |
| 방명록 스팸 | 불쾌한 내용 노출 | Apps Script에서 길이 제한, 시트에서 `deleted` 열로 즉시 숨김, 필요 시 승인 후 표시로 전환 |
| 무료 플랜 한도·정책 변경 | 서비스 중단 | 정적 기능은 영향 없음, Apps Script 일일 호출 한도는 청첩장 규모에서 여유가 큼(착수 시 수치 확인) |
| 일정 지연 | 공개 지연 | 섹션 플래그로 미완성 섹션을 숨기고 먼저 공개, 단계 5는 생략 가능 |

## 11. 결정 필요 사항

착수 전 두 사람이 정해야 할 항목이다. 확정 결과는 `docs/DECISIONS.md`에 기록한다.

1. 예식 일시, 장소(홀 이름, 주소), 공개 목표일
2. 디자인 콘셉트(5장 A~D 중 택 1) 및 참고 이미지
3. 지도: 카카오맵(1안) 확정 여부
4. ~~방명록·RSVP 저장소~~ → Google Apps Script + Sheets로 확정(2026-10-25). Google 계정 연동 시점만 남음
5. 배경음악 포함 여부와 음원 저작권 확인
6. ~~배포 방식~~ → GitHub Actions + GitHub Pages로 확정(2026-10-25). 사용자 지정 도메인 사용 여부만 남음
7. 사진 수량, 메인 사진·영상 유무, 원본 보관 위치
8. 계좌·송금 링크 공개 범위(양가 모두 또는 일부)
9. 15번 개성 요소 중 구현할 항목
10. 예식 후 사이트 유지 기간

## 12. 참고 자료

조사일 2026-10-25. 아래 중 developers.kakao.com, devtalk.kakao.com, webkit.org, firebase.google.com, supabase.com 페이지는 이 작업 환경에서 직접 열리지 않아 검색 결과 요약에 의존했다. 해당 항목은 착수 시 원문 재확인이 필요하다.

- 오픈소스 청첩장: 2장 표의 각 GitHub 저장소
- 라이브러리: 4.2장 표의 각 GitHub 저장소, [@gsap/react](https://github.com/greensock/react)
- 카카오맵 API 정책 변경(2026-07-21): [카카오맵 공통 가이드](https://developers.kakao.com/docs/latest/ko/kakaomap/common), [DevTalk 공지](https://devtalk.kakao.com/t/api-notice-on-new-kakao-map-api-features-and-free-quota-policy/150222) — 원문 미확인
- 카카오톡 공유 JavaScript: [공식 가이드](https://developers.kakao.com/docs/latest/ko/kakaotalk-share/js-link) — 원문 미확인
- 카카오톡 OG 이미지 캐시: [DevTalk 답변](https://devtalk.kakao.com/t/og/147109) — 원문 미확인
- 네이버 지도 무료 이용 조건: [Naver Cloud Maps 가이드](https://guide.ncloud-docs.com/docs/ko/application-maps-app-vpc) — 원문 미확인
- iOS 미디어 자동 재생 정책: [WebKit 블로그 "New video Policies for iOS"](https://webkit.org/blog/6784/new-video-policies-for-ios/) — 원문 미확인, 2016년 문서
- 무료 플랜 한도: [Firebase 요금](https://firebase.google.com/pricing), [Supabase 요금](https://supabase.com/pricing) — 원문 미확인
