# 청첩장 내용 바꾸기

청첩장에 보이는 글과 사진은 모두 이 폴더에서 바꾼다. 코드(`src/`)는 건드리지 않아도 된다.

```
config/
  wedding.json        글 (이름, 날짜, 장소, 섹션 제목·안내 문구, 섹션 켜고 끄기)
  images/
    cover.webp        보관 중인 이전 표지 사진
    gallery/
      01.webp … 10.webp 갤러리 사진 (파일 이름 순서대로 표시)
    venue/
      exterior.webp     예식장 건물 전경
      entrance.webp     예식장 정면 입구
```

수정한 뒤 `npm run dev`로 확인한다. 개발 서버가 켜져 있으면 저장할 때 화면이 다시 불러와진다. 배포는 `main`에 푸시하면 GitHub Actions가 빌드한다.

## wedding.json 작성 규칙

- 글자는 큰따옴표로 감싼다: `"이OO"`. `true`, `false`, 숫자는 따옴표 없이 쓴다.
- 항목 사이에는 쉼표를 넣고, 마지막 항목 뒤에는 쉼표를 넣지 않는다.
- JSON에는 주석이 없다. 메모가 필요하면 `"_memo": "..."`처럼 이름이 `_`로 시작하는 항목을 쓰면 무시된다.
- 이름을 잘못 쓰거나 형식이 틀리면 `npm run dev`, `npm test`, `npm run build`가 어느 항목이 문제인지 알려 준다.
  예: `config/wedding.json 오류 — "event.datePlaceholder": 값은 true 또는 false여야 합니다(따옴표 없이).`
- 여러 줄 문구(`body`, `intro`)는 한 줄에 한 항목인 배열이다. `""`(빈 줄)은 문단을 나눈다.
- 각 섹션의 `enabled`를 `false`로 바꾸면 그 섹션이 화면에서 빠진다.

## 항목별 설명

### couple (신랑·신부)

| 항목 | 설명 | 예 |
|---|---|---|
| `groom.name`, `bride.name` | 화면에 쓰는 이름 | `"이OO"` |
| `groom.relation`, `bride.relation` | 부모님 이름 옆 관계 | `"장남"`, `"차녀"`, `"아들"` |
| `father.name`, `mother.name` | 혼주 이름. 항목을 지우면 표시하지 않는다 | `"이OO"` |
| `father.deceased`, `mother.deceased` | `true`면 이름 앞에 故 표시 (선택) | `true` |

### event (예식 정보)

| 항목 | 설명 | 예 |
|---|---|---|
| `startsAt` | 예식 일시, 한국 시간. 달력·요일·D-day 계산에 쓴다 | `"2027-06-27T13:00:00+09:00"` |
| `datePlaceholder` | 날짜가 확정되기 전에는 `true` (아래 설명) | `true` |
| `venueName` | 예식장 이름 | `"노블발렌티 삼성"` |
| `hall` | 홀 이름. 없으면 `""` | `"OO홀"` |
| `address` | 도로명 주소. `\n`으로 표시할 줄을 나눈다. 복사·지도 검색에는 한 줄로 합친 주소를 쓴다 | `"서울특별시 강남구\n봉은사로 637"` |
| `addressJibun` | 지번 주소 (선택) | `"삼성동 109-6"` |
| `coords.lat`, `coords.lng` | 지도 핀 좌표. 지도에서 예식장을 찾아 확인한다 | `37.5153463`, `127.0648868` |
| `coords.placeholder` | 좌표가 임시이면 `true`. 지도 아래에 안내 문구가 나온다 (선택) | `true` |
| `venuePhone` | 예식장 전화번호 (선택). 지금은 화면에 표시하지 않는다 | `"02-000-0000"` |
| `naverMapUrl` | 네이버 지도에서 공유한 장소 링크 (선택). 설정하면 네이버지도 버튼이 이 링크를 연다 | `"https://naver.me/5uIYZdsZ"` |

**datePlaceholder**: `true`인 동안에는 화면 어디에도 확정되지 않은 날짜가 나오지 않는다. `startsAt`에서 연도만 쓰고 나머지는 "OO월 OO일", "OO요일 오후 OO시", D-day는 "D-OOO"로 표시한다. 날짜가 정해지면 `startsAt`을 바꾸고 `datePlaceholder`를 `false`로 바꾼다.

### 섹션 (화면 순서)

대부분의 섹션은 `enabled`(표시 여부), `eyebrow`(제목 위 작은 영문 라벨), `title`(제목)을 가진다. `eyebrow`나 `title`을 `""`로 두면 그 줄이 빠진다.

| 섹션 | 추가 항목 | 설명 |
|---|---|---|
| `cover` (첫 화면) | `image`, `alt` | `image`는 `config/images/` 기준 상대 경로(`"gallery/04.webp"`), `alt`는 화면 낭독기용 설명. 오프닝과 표지가 같은 사진을 쓴다. 제목 없이 `eyebrow`만 쓴다 |
| `greeting` (인사말) | `body`, `quote` | `body`는 줄 단위 배열, `""`은 문단 구분. `quote`는 `{ "text": "...", "source": "..." }` (선택). 종교적 표현은 쓰지 않기로 했다 |
| `family` (혼주) | 없음 | `couple`의 부모님 이름과 관계를 신랑 측·신부 측 두 열로 표시한다 |
| `calendar` (달력) | 없음 | 제목은 날짜에서 자동으로 만든다. `title` 항목이 없다 |
| `gallery` (갤러리) | `alt`, `captions` | `alt` 뒤에 번호가 붙는다("신랑 신부 사진 3"). 특정 사진만 설명을 바꾸려면 `"captions": { "03.jpg": "제주에서" }` |
| `location` (오시는 길) | `images`, `transport`, `transportLinks` | `images`는 예식장 사진과 설명 목록(선택). `transport`는 `subway`, `bus`, `car`, `parking`, `shuttle` 각각 줄 단위 배열. `transportLinks`는 같은 키에 대응하는 HTTPS 지도 링크(선택). 필요 없는 항목은 지운다 |
| `account` (마음 전하실 곳) | `intro` | 안내 문구 줄 배열. 계좌번호는 아래 "개인정보"를 본다 |
| `rsvp` (참석 의사) | `intro` | 안내 문구 줄 배열 |
| `guestbook` (방명록) | 없음 | |
| `share` (공유) | `intro`, `kakaoTitle`, `kakaoDescription`, `buttonLabel` | `kakaoTitle`은 카카오톡 카드 제목이자 브라우저 탭 제목. `kakaoDescription`(선택)을 비우면 "2027년 OO월 OO일 · 노블발렌티 삼성"처럼 날짜와 예식장으로 만든다 |
| `footer` (맨 아래) | `credit` | 맨 아래 작은 글씨. 이 섹션은 `eyebrow`, `title`이 없다 |

`kakaoTitle`과 설명 문구는 `index.html`의 `<title>`, 검색 설명, 카카오톡 미리보기(og:title, og:description)에도 들어간다.

폼 라벨, 버튼 이름(복사, 남기기 등), 오류 안내처럼 화면 동작에 붙은 문구는 코드에 있다.

## 사진 바꾸기

1. 사진을 `.jpg`, `.jpeg`, `.png`, `.webp` 중 하나로 준비한다.
2. 첫 화면 사진은 `wedding.json`의 `cover.image`에 `config/images/` 기준 상대 경로를 적는다. 현재는 `gallery/04.webp`를 오프닝·표지·갤러리에서 함께 사용한다. 사진을 바꾸면 `cover.alt` 설명도 바꾼다.
3. 갤러리 사진은 `config/images/gallery/`에 넣는다. 폴더 안의 모든 사진이 **파일 이름 순서**로 표시된다(`2.jpg`가 `10.jpg`보다 앞). `01.jpg`, `02.jpg`처럼 두 자리 번호를 권장한다. 빼려면 파일을 지운다.
4. 가로·세로 크기는 빌드할 때 파일에서 읽으므로 따로 적지 않는다. 휴대폰 사진의 회전 정보(EXIF)도 반영한다.

예식장 사진은 `config/images/venue/`에 넣고 `location.images`에 `{ "image": "venue/exterior.webp", "alt": "노블발렌티 삼성 건물 전경" }`처럼 등록한다. 장소명·주소 오른쪽에 작은 사진을 목록 순서대로 쌓아 표시하며 원본 비율을 유지한다. `alt`는 화면 낭독기용 설명이다. 사진을 빼려면 해당 항목을 지운다.

권장 크기와 용량:

| 사진 | 비율 | 크기 | 용량 |
|---|---|---|---|
| 첫 화면 사진 | 3:4 세로 (화면에서 3:4로 잘린다) | 1200 x 1600 | 400 KB 이하 |
| 갤러리 세로 사진 | 4:5 | 1200 x 1500 | 300 KB 이하 |
| 갤러리 가로 사진 | 4:3 | 1200 x 900 | 300 KB 이하 |

갤러리는 원본 비율을 유지하며, 가로 사진은 두 열 전체를 쓴다. 세로 사진 두 장과 가로 사진 한 장을 번갈아 배치하면 보기 좋다. 사진은 미리 줄여서 넣는다(스마트폰 원본은 수 MB라 청첩장이 느려진다). 처음 5장이 먼저 보이고 나머지는 "사진 더 보기"로 펼친다. 사진을 삭제하거나 이름을 바꾸면 `gallery.captions`의 해당 키도 함께 바꾼다.

이 저장소가 공개 저장소라면 여기 넣은 사진도 공개된다. 원본 사진은 저장소 밖에 보관한다.

현재 사진은 긴 변 최대 1600px의 WebP로 저장했고 EXIF를 제거했다. 원본은 저장소 밖에 보관한다. `npm run placeholders`는 개발용 임시 사진 생성 명령이므로 실제 사진을 적용한 상태에서는 실행하지 않는다.

## 개인정보 (계좌번호)

계좌번호는 이 폴더에 넣지 않는다. 저장소 기록에 남지 않도록 빌드할 때 환경 변수로 넣는다. 값이 없으면 가짜 예시 번호와 "예시 계좌" 표시가 나온다. 전화번호는 수집하거나 표시하지 않는다.

로컬에서 확인할 때:

1. `.env.example`을 `.env.local`로 복사한다 (`.env.local`은 git에 올라가지 않는다).
2. `VITE_ACCOUNTS`에 JSON을 한 줄로 넣는다. 형식은 `.env.example`의 주석을 따른다.

```
VITE_ACCOUNTS={"groom":[{"holder":"이OO","bank":"OO은행","number":"000-0000-0000"}],"bride":[{"holder":"박OO","bank":"OO은행","number":"000-0000-0000"}]}
```

배포할 때: GitHub 저장소 → Settings → Secrets and variables → Actions → New repository secret에서 `VITE_ACCOUNTS`를 같은 값으로 등록한다. 카카오 키(`VITE_KAKAO_JS_KEY`)와 방명록·RSVP 주소(`VITE_APPS_SCRIPT_URL`)도 같은 방법으로 넣는다.

배포된 페이지를 여는 사람은 이 번호를 볼 수 있다. 환경 변수로 빼는 목적은 저장소 기록과 검색 노출을 막는 것이다.

## 카카오톡 미리보기 이미지

카카오톡 공유 썸네일은 `public/og-image.png`(1200 x 630)이다. 이름·날짜·예식장을 바꿨다면 다시 만든다.

```bash
npm run og              # public/og-image.png 생성 (Playwright 필요, 웹 글꼴을 내려받으므로 인터넷 연결 필요)
node scripts/make-og.mjs --dry-run   # 들어갈 문구만 확인
```

이미지를 바꾼 뒤에는 `index.html`의 `og-image.png?v=3`에서 숫자를 하나 올린다(`?v=4`). 카카오톡은 주소 단위로 미리보기를 캐시하므로 숫자를 바꾸지 않으면 예전 이미지가 계속 나온다. 이미 공유된 링크의 캐시는 카카오 개발자 사이트의 "공유 디버거"에서 지울 수 있다.
