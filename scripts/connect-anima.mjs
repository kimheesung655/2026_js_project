// Anima Inspect에서 저장한 원본을 유지하면서 서비스 요소의 id를 연결합니다.
import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const path = name => new URL(name, root);
const previous = await readFile(path('index.html'), 'utf8');
const modal = previous.slice(previous.indexOf('<!-- 리뷰 상세 모달 -->'), previous.indexOf('<script src="script.js">'));
const dialog = previous.match(/<dialog id="mealDialog"[\s\S]*?<\/dialog>/)?.[0];
if (!modal || !dialog) throw new Error('기존 리뷰 모달과 급식 선택 창이 필요합니다.');
let html = await readFile(path('design-source/anima-main/index.html'), 'utf8');
html = html.replace('<html>', '<html lang="ko">').replace('<body>', '<body class="anima-page">');
html = html.replace('<link rel="stylesheet" href="globals.css">', '<title>급식어때</title>\n<link rel="stylesheet" href="style.css">\n<link rel="stylesheet" href="anima-globals.css">');
html = html.replace('<link rel="stylesheet" href="style.css">\n</head>', '<link rel="stylesheet" href="anima-style.css">\n<link rel="stylesheet" href="anima-integration.css">\n</head>');
html = html.replace(/<div class="text-wrapper"\s*>[^<]*<\/div>/, '<button class="text-wrapper" id="mealPicker" aria-label="급식 날짜와 식사 선택" title="날짜·식사 선택"><span id="todayDate"></span></button>');
html = html.replace(/<p class="p"\s*>[^<]*<\/p>/, '<p class="p" id="mealMenu" aria-live="polite">급식을 불러오는 중입니다.</p>');
html = html.replace(/<div class="group-2"\s*>[\s\S]*?<\/div>/, `<details class="group-2" id="mealDetails" hidden>
  <summary class="text-wrapper-4">학교급식 식재료 원산지 및 영양표시제<img class="line" src="img/line-11.svg" alt=""></summary>
  <div class="nutrition-popup"><p id="mealCalories"></p><p>메뉴의 숫자는 알레르기 유발 식재료 번호입니다.</p><h3>원산지</h3><p id="mealOrigin"></p><h3>영양 정보</h3><p id="mealNutrition"></p></div></details>`);
for (const [className, id] of [['group-11', 'writeBtn'], ['group-12', 'searchBtn'], ['text-wrapper-8', 'rankBtn']]) {
  html = html.replace(`class="${className}"`, `class="${className}" id="${id}" role="button" tabindex="0"`);
}
html = html.replace('class="frame-8"', 'class="frame-8 sort-buttons"');
for (const [className, active] of [['text-wrapper-15', true], ['text-wrapper-16', false], ['text-wrapper-14', false]]) {
  html = html.replace(`class="${className}"`, `class="${className} sort-btn${active ? ' active' : ''}" role="button" tabindex="0"`);
}
html = html.replace(/<img class="image"[^>]*>/, `<img class="image" id="mealImage" hidden alt="">
<div id="photoPlaceholder" class="anima-photo-status"><strong>급식 사진</strong><small id="photoStatus">불러오는 중입니다.</small></div>
<a id="photoSource" class="anima-photo-source" href="https://www.e-mirim.hs.kr/schoollife/food.do" target="_blank" rel="noopener noreferrer">사진 출처: 미림마이스터고 학교급식 게시판 ↗</a>`);
html = html.replace('</body>', `\n<footer class="anima-footer"><a href="login.html">로그인 / 회원가입</a></footer>\n${dialog}\n${modal}\n<script src="script.js"></script>\n<script src="anima-review.js"></script>\n<script src="meal.js"></script>\n</body>`);

// 같은 피그마 레이어에서 내려받은 원본 에셋을 Anima 파일 이름에 연결합니다.
const assets = { 'line-11.svg': 'nutrition-line.svg', 'line-6.svg': 'divider.svg', 'line-1.svg': 'header-line.svg',
  'vector-2.svg': 'page-line.svg', 'star-7.svg': 'star-popular.svg', 'star-6.svg': 'star-second.svg',
  'plus.png': 'plus.png', 'search.png': 'search.png', 'image-6.png': 'reference-meal.png', 'image.svg': 'star-review.svg' };
for (const match of html.matchAll(/src="img\/(star-[^"/]+\.svg)"/g)) {
  if (!(match[1] in assets)) assets[match[1]] = match[1].startsWith('star-12') ? 'star-last.svg' : 'star-review.svg';
}
await mkdir(path('design-source/anima-main/img/'), { recursive: true });
// 원본 HTML에서만 사용하는 기준 사진도 보존합니다.
assets['image-6.png'] = 'reference-meal.png';
for (const [name, asset] of Object.entries(assets)) await copyFile(path(`assets/figma/${asset}`), path(`design-source/anima-main/img/${name}`));
html = html.replaceAll('src="img/', 'src="design-source/anima-main/img/');
await writeFile(path('index.html'), html);
console.log('Anima HTML + 기존 서비스 연결 완료');
