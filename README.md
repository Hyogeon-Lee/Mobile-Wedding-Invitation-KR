# Mobile Wedding Invitation (KR)

이효건·박민경의 모바일 청첩장. 링크 하나로 카카오톡·문자·이메일에 전달하고, 글과 사진은 코드 수정 없이 `config/`에서 바꾼다.

배포 주소: <a href="https://hyogeon-lee.github.io/Mobile-Wedding-Invitation-KR/" target="_blank" rel="noopener noreferrer">https://hyogeon-lee.github.io/Mobile-Wedding-Invitation-KR/</a>

## 디자인

- 오프닝: 어둡지 않은 표지 사진 위에 "We're getting married" 손글씨가 획 순서대로 그려지고(약 3.5초) 1초에 걸쳐 표지로 바뀐다. 손글씨 획 데이터 출처는 `public/licenses/opening-lettering.txt`.
- 색: 아이보리 바탕 `#fcfcfc`, 먹색 글자 `#36423b`, 초록 강조 `#377656`, 큰 숫자와 작은 표시에만 주황 `#d9671f`. 섹션마다 sand `#f1f6ef`, sky `#e6f1f2`, mint `#e9f4e8` 단색 틴트를 번갈아 깐다. 분홍·살구·금빛 계열은 쓰지 않는다.
- 서체: 본문 Pretendard, 제목 Noto Serif KR, 날짜·D-day 숫자 Cormorant Garamond.
- 사진: 표지와 마무리 사진은 전체 폭. 인사말은 사진 윗부분의 빈 공간에 글을 올린다. 갤러리는 사진별 원본 비율을 지키며 줄마다 폭을 꽉 채우고, 처음 12장 뒤는 가로 스크롤로 본다. 달력 뒤와 참석 의사 뒤에는 글 없는 전체 폭 사진(`interludes`)이 들어간다.
- 라인아트: 섹션 제목 아래 초록 선 그림 다섯 가지. 반지(혼주), 봉투(마음 전하실 곳), 체크 표시한 답장 카드(참석 의사), 손잡은 신랑 신부(방명록), 종이비행기(공유). `src/components/LineArt.tsx`.
- 모션: 섹션 내용은 보일 때 0.65초 동안 떠오르고(`Reveal`), Lenis 스무스 스크롤, PhotoSwipe 라이트박스. 모션 감소 설정에서는 즉시 표시한다.
- 접근성: 본문 15px 이상, 대비 4.5:1 이상, 터치 영역 44px, 큰 글자 모드 토글, 모든 사진에 설명.

## 구성

표지 → 인사말 → 양가 혼주 → 갤러리 → 달력·D-day → 사진 → 오시는 길 → 마음 전하실 곳 → 참석 의사 → 사진 → 방명록 → 청첩장 전하기 → 마무리. 섹션마다 `config/wedding.json`의 `enabled`로 끄고 켠다.

## 스택

Vite 8, React 19, TypeScript, Tailwind CSS 4, motion/react, Lenis, react-photo-album, PhotoSwipe, lucide-react. 방명록·RSVP는 Google Apps Script + Google Sheets, 지도는 카카오맵, 배포는 GitHub Actions → GitHub Pages.

## 실행

```bash
npm install
npm run dev        # http://localhost:5173
npm run build && npm run preview
npm run typecheck && npm run lint && npm test
npm run og         # public/og-image.png (카카오톡 썸네일, Playwright 필요)
npm run qa:shots   # 기기별 스크린샷 (qa/, Playwright 필요)
```

## 내용과 설정

- 글: `config/wedding.json`. 사진: `config/images/`. 항목 설명과 사진 규격은 [config/README.md](config/README.md).
- 계좌번호: `.env.local`의 `VITE_ACCOUNTS` (`.env.example` 참고). 저장소에는 넣지 않는다.
- 카카오 키: `VITE_KAKAO_JS_KEY`. 방명록·RSVP: `google-apps-script/Code.gs`를 배포한 뒤 `VITE_APPS_SCRIPT_URL`. 비어 있으면 미리보기 모드로 동작한다.
- 배포: `main`에 푸시하면 GitHub Actions가 빌드한다. 위 세 값은 저장소 Secrets에 같은 이름으로 넣는다.

## 문서

- [config/README.md](config/README.md): 글·사진 바꾸는 법
- [docs/DECISIONS.md](docs/DECISIONS.md): 결정 기록
- [docs/PLAN.md](docs/PLAN.md): 초기 계획서
- [CHANGELOG.md](CHANGELOG.md)
