# Mobile Wedding Invitation (KR)

한국 예비 신랑·신부를 위한 모바일 청첩장. 정형화된 템플릿이 아닌 두 사람의 취향이 드러나는 청첩장을 직접 개발하는 것이 목표이며, 링크 하나로 Android·iOS·웹에 전달한다.

- 개발 계획서: [docs/PLAN.md](docs/PLAN.md)
- 현재 상태: 계획 수립 단계. 코드 스캐폴딩은 계획서 8장의 단계 1에서 시작한다.

## 계획 요약

- 정보 구성: 공개 오픈소스 청첩장(heejin-hwang, S-jooyoung, juhonamnam, gpjeong 등)의 공통 섹션을 따른다.
- 스택: Vite + React 19 + TypeScript + Tailwind CSS v4.
- 디자인·모션: Motion, Lenis, Swiper, PhotoSwipe, canvas-confetti를 핵심으로 하고 GSAP·Lottie·tsParticles는 선택.
- 연동: 카카오맵, 카카오톡 공유, 네비 딥링크, Firebase Firestore(방명록·RSVP, 선택).
- 배포: GitHub Actions → GitHub Pages(1안), Vercel(2안).
- 개인정보: 전화번호·계좌번호는 환경 변수로 주입하고 원본 사진은 저장소에 두지 않는다.
