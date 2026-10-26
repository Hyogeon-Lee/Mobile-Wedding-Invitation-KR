# Mobile Wedding Invitation (KR)

한국 예비 신랑·신부를 위한 모바일 청첩장. 정형화된 템플릿이 아닌 두 사람의 취향이 드러나는 청첩장을 직접 개발하는 것이 목표이며, 링크 하나로 Android·iOS·웹에 전달한다.

- 개발 계획서: [docs/PLAN.md](docs/PLAN.md)
- 결정 기록: [docs/DECISIONS.md](docs/DECISIONS.md)
- 현재 내용: 이효건·박민경, 2027년 6월 27일 일요일 오후 1시, 노블발렌티 삼성. 실제 사진 10장과 자연광 디자인을 적용했다. [디자인·검증 기록](docs/SOFT-DESIGN.md)을 참고한다.

## 계획 요약

- 정보 구성: 표지, 인사말, 혼주·가족, 예식 일시·달력, 갤러리, 오시는 길, 마음 전하실 곳, 참석 여부, 방명록, 공유, 푸터(11개 섹션).
- 스택: Vite + React 19 + TypeScript + Tailwind CSS v4.
- 디자인·모션: Motion, Lenis, Swiper, PhotoSwipe, canvas-confetti를 핵심으로 하고 GSAP·Lottie·tsParticles는 선택.
- 연동: 카카오맵, 카카오톡 공유, 네비 딥링크, Google Apps Script + Google Sheets(방명록·RSVP).
- 배포: GitHub Actions → GitHub Pages(1안), Vercel(2안).
- 개인정보: 계좌번호는 환경 변수로 주입하고 원본 사진은 저장소에 두지 않는다. 연락처 기능은 사용하지 않는다.

## 실행

```bash
npm install
npm run dev            # http://localhost:5173
npm run build && npm run preview
npm run qa:shots       # vite preview 위에서 기기별 스크린샷 (qa/, Playwright 필요)
npm run og             # public/og-image.png 생성 (카카오톡 공유 썸네일)
```

글은 `config/wedding.json`, 사진은 `config/images/`(첫 화면 `cover.webp`, 갤러리 `gallery/` 폴더의 파일 이름 순서)에서 바꾼다. 항목별 설명과 사진 규격은 [config/README.md](config/README.md)에 있다. 계좌는 `.env.local`의 `VITE_ACCOUNTS`(`.env.example` 참고), 방명록·RSVP 백엔드는 `google-apps-script/Code.gs`를 배포한 뒤 `VITE_APPS_SCRIPT_URL`에 설정한다. URL이 비어 있으면 미리보기 모드로 동작한다.
