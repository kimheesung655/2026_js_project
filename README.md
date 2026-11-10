# 급식어때

미림마이스터고 학생들이 급식에 별점과 리뷰를 남기고, 이전 리뷰를 검색하거나 인기 메뉴 순위를 확인할 수 있는 웹 서비스입니다.

급식 메뉴와 영양 정보는 NEIS 급식 API에서 가져오고, 급식 사진은 미림마이스터고 학교급식 게시판에서 같은 날짜의 게시글을 찾아 표시합니다. 로그인, 프로필과 리뷰 데이터는 Supabase로 관리합니다.

## 주요 기능

- 이메일 회원가입 및 로그인
- 날짜별 중식 메뉴, 칼로리, 영양 정보와 원산지 조회
- 미림마이스터고 홈페이지의 날짜별 중식 사진 조회
- 리뷰 작성, 조회, 수정과 삭제
- 메뉴 이름으로 리뷰 검색
- 메뉴별 평균 별점을 계산한 인기 순위

## 실행 환경

- Node.js 22 이상
- Supabase 프로젝트
- 인터넷 연결

별도의 외부 npm 라이브러리는 사용하지 않습니다.

## 실행 방법

1. 저장소를 내려받습니다.

   ```bash
   git clone https://github.com/kimheesung655/2026_js_project.git
   cd 2026_js_project
   ```

2. `.env.example`을 복사해 프로젝트 최상위 폴더에 `.env` 파일을 만듭니다.

3. `.env`에 Supabase 프로젝트 설정을 입력합니다.

   ```env
   SUPABASE_URL=https://프로젝트주소.supabase.co
   SUPABASE_PUBLISHABLE_KEY=Supabase_Publishable_Key
   NEIS_API_KEY=NEIS_API_Key
   PORT=3000
   ```

   `SUPABASE_URL`과 `SUPABASE_PUBLISHABLE_KEY`는 필수입니다. `NEIS_API_KEY`는 발급받은 경우 입력하며, 실제 키가 없어도 NEIS 공개 API 범위에서 조회할 수 있습니다.

4. 새 Supabase 프로젝트에서 사용할 경우 SQL Editor에서 `schema.sql`을 실행합니다.

5. 서버를 실행합니다.

   ```bash
   npm start
   ```

6. 브라우저에서 다음 주소로 접속합니다.

   ```text
   http://localhost:3000/login.html
   ```

`index.html` 파일을 직접 열면 API 요청이 동작하지 않으므로 반드시 `npm start`로 서버를 실행해야 합니다.

## 테스트 계정

- 이메일: `s2563@e-mirim.hs.kr`
- 비밀번호: 클래스룸 과제의 비공개 댓글로 제출

로그인 후 메인 화면에서 급식 정보와 리뷰를 확인할 수 있습니다. 리뷰 작성 페이지에서 리뷰를 등록하고, 검색 페이지와 인기 순위 페이지에서 등록된 데이터가 반영되는지 확인할 수 있습니다.

## 주요 페이지

- `/login.html`: 로그인
- `/signup.html`: 회원가입
- `/index.html`: 급식 정보와 실시간 리뷰
- `/write.html`: 리뷰 작성
- `/search.html`: 메뉴 리뷰 검색
- `/rank.html`: 인기 메뉴 순위

## 데이터베이스

- `schools`: 학교 이름과 NEIS 학교 코드
- `profiles`: 로그인 사용자 이름, 학번과 학교
- `reviews`: 메뉴 이름, 별점, 내용, 급식 날짜와 작성자

테이블 생성문, 관계와 RLS 정책은 `schema.sql`에 있습니다.

## 환경변수 및 보안

실제 `.env` 파일은 Git에 포함되지 않습니다. 제출용 `.env.example`에는 필요한 환경변수 이름만 들어 있습니다. Supabase Service Role Key처럼 관리자 권한을 가진 키는 이 프로젝트에 사용하거나 저장하지 않습니다.

## 제작자

- 김희성
- 노가우
