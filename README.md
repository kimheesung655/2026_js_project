# 급식어때 메인 페이지

Node.js 22 이상에서 터미널로 `npm start`를 실행하고 http://localhost:3000 에 접속합니다.
HTML 파일을 더블클릭하거나 Live Server만 실행하면 학교 게시판 조회 서버가 연결되지 않습니다.
추가 패키지 설치는 필요 없습니다.

- `meal.js`: 날짜·조식/중식/석식 선택, 급식·사진 표시 및 오류 처리.
- `meal-service.mjs`: 나이스 API 연결, 학교 급식 게시글 날짜 검색 및 사진 추출.
- `server.mjs`: 정적 파일 및 `/api/meal`, `/api/photo` 제공. 외부 조회 결과는 5분 캐시.

학교는 미림마이스터고(서울교육청 B10, 학교 코드 7011569)로 설정되어 있습니다.
나이스 인증키 없이 샘플 요청으로 동작하지만 실제 서비스에는 인증키를 발급받아 사용하세요.
PowerShell에서 `$env:NEIS_API_KEY='발급받은 키'` 설정 후 `npm start`를 실행하면 됩니다.
인증키는 브라우저 코드나 Git에 넣지 않습니다.

사진은 https://www.e-mirim.hs.kr/schoollife/food.do 게시판의 날짜 제목과 조식·중식·석식 구분을 확인하여 가져옵니다.
선택한 식사의 사진이 없으면 다른 날짜 사진으로 대체하지 않습니다.
홈페이지 구조가 바뀌면 `findPost`와 `findPhoto`를 수정해야 합니다.

팀원이 새 화면을 연결할 때 `meal.js`를 포함하고 현재 급식 관련 요소의 id를 유지해주세요.
팀원 최신 버전(origin/main 8c7b0d2)의 화면과 리뷰 정렬·상세·수정·삭제 스크립트를 병합했습니다.
메인 화면은 Anima Inspect에서 생성한 Figma `33:2`의 HTML·CSS를 사용합니다.
원본 코드는 `design-source/anima-main`에 수정 없이 보존하며, 피그마 원본 에셋을 `img`에 연결했습니다.
Anima의 프로젝트 ZIP 다운로드는 유료 플랜이 필요해 무료로 제공되는 Inspect 코드 표시 기능을 사용했습니다.
`scripts/connect-anima.mjs`는 원본 HTML에 기능 연결에 필요한 id와 기존 급식 선택·리뷰 모달을 연결합니다.
`anima-review.js`는 팀원 리뷰 데이터를 Anima의 리뷰 슬롯에 표시합니다.
`anima-integration.css`는 동적 콘텐츠에 필요한 표시·상태 스타일을 보완합니다.
원본 디자인은 1440px 고정 배치로, 작은 화면에서는 가로 스크롤이 생깁니다.
급식 날짜를 누르면 날짜·식사 선택 창이 열립니다. 로그인 링크는 화면 하단에 있습니다.
현재 팀원의 별도 페이지는 일부 동작이 시연용입니다. 로그인 인증과 리뷰 영구 저장,
검색 및 순위의 실제 데이터 연결은 아직 구현되지 않았습니다.
회원가입 화면에서 참조하는 globals.css 및 전용 레이아웃 스타일도 저장소에 포함되어 있지 않습니다.

검증: `npm test`. 공개 사이트 연결에는 인터넷이 필요합니다.

수업 자료에 맞춘 브라우저 코드:
- `meal.js`: 수업의 XMLHttpRequest + onload + JSON.parse 방식으로 급식과 사진 조회.
- 날짜는 Date의 getFullYear/getMonth/getDate/getDay와 padStart로 표시합니다.
- 화면 요소는 getElementById로 선택하고 onclick/onchange/onsubmit으로 연결합니다.
- 리뷰 페이지 버튼은 계산된 번호만 innerHTML에 넣으며, 사용자 작성 내용은 textContent로 표시합니다.
- async/await, Promise, fetch, AbortController, Intl, 선택적 연결(?.), 즉시 실행 함수는 브라우저 코드에서 제거했습니다.
- 날짜 선택 창은 일반 div와 hidden 속성으로 열고 닫습니다.
- 현재 날짜는 사용자 컴퓨터의 날짜를 사용합니다. 한국 시간으로 설정한 컴퓨터에서 학교 날짜와 일치합니다.

학교 사진 조회 서버(`server.mjs`, `meal-service.mjs`), 변환 도구(`scripts`), 자동 테스트(`tests`)에는
수업 자료에 없는 Node.js 기능이 남아 있습니다. 브라우저의 동작 코드와 구분하여 확인해주세요.
timeout/onerror 같은 요청 오류 처리와 hidden/src/onload 같은 화면 속성은 기능 유지에 필요한 보완입니다.
