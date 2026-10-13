import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { getMeal, getPhoto, validDate, MEAL_NAMES } from './meal-service.mjs';

const files = { '/': ['index.html', 'text/html'], '/index.html': ['index.html', 'text/html'],
  '/signup.html': ['signup.html', 'text/html'], '/style.css': ['style.css', 'text/css'],
  '/login.html': ['login.html', 'text/html'], '/search.html': ['search.html', 'text/html'],
  '/rank.html': ['rank.html', 'text/html'], '/write.html': ['write.html', 'text/html'],
  '/script.js': ['script.js', 'text/javascript'], '/meal.js': ['meal.js', 'text/javascript'] };
files['/main-design.css'] = ['main-design.css', 'text/css'];
for (const asset of ['plus.png', 'search.png', 'star-popular.svg', 'star-second.svg',
  'star-review.svg', 'star-last.svg', 'divider.svg', 'header-line.svg', 'nutrition-line.svg', 'page-line.svg']) {
  files[`/assets/figma/${asset}`] = [`assets/figma/${asset}`, asset.endsWith('.svg') ? 'image/svg+xml' : 'image/png'];
}
const cache = new Map();
function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}
const server = http.createServer(async (req, res) => {
  try {
    if (req.method !== 'GET') return send(res, 405, { error: 'GET 요청만 가능합니다.' });
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/meal' || url.pathname === '/api/photo') {
      const date = url.searchParams.get('date') || '';
      const mealType = url.searchParams.get('mealType') || '2';
      if (!validDate(date) || !MEAL_NAMES[mealType]) return send(res, 400, { error: '날짜 또는 식사 구분이 잘못되었습니다.' });
      const key = `${url.pathname}:${date}:${mealType}`;
      const saved = cache.get(key);
      if (saved && saved.expires > Date.now()) return send(res, 200, saved.data);
      const data = url.pathname === '/api/meal' ? { meal: await getMeal(date, mealType) } : await getPhoto(date, mealType);
      if (cache.size >= 200) cache.delete(cache.keys().next().value);
      cache.set(key, { data, expires: Date.now() + 5 * 60 * 1000 });
      return send(res, 200, data);
    }
    const file = files[url.pathname];
    if (!file) return send(res, 404, { error: '페이지를 찾을 수 없습니다.' });
    const body = await readFile(new URL(file[0], import.meta.url));
    res.writeHead(200, { 'Content-Type': `${file[1]}; charset=utf-8` });
    res.end(body);
  } catch (error) {
    console.error(error.message);
    send(res, 502, { error: '외부 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.' });
  }
});
server.listen(Number(process.env.PORT || 3000), '127.0.0.1', () => console.log('급식어때: http://localhost:3000'));
