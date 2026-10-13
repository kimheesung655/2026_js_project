import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findPost, findPhoto, validDate, readMeal } from '../meal-service.mjs';

test('실제 달력 날짜만 허용한다', () => {
  assert.equal(validDate('2026-02-30'), false);
  assert.equal(validDate('2026-10-13'), true);
  assert.equal(validDate('../index'), false);
});
test('게시 날짜 대신 급식 제목으로 날짜를 맞춘다', () => {
  const html = `<a href="#;" onclick="goDetail('5322');return false;" title="26/10/13(화)">26/10/13(화)</a>`;
  assert.equal(findPost(html, '2026-10-13'), '5322');
  assert.equal(findPost(html, '2026-10-12'), null);
});
test('식사 종류를 구분하고 다른 날짜나 외부 이미지로 대체하지 않는다', () => {
  const html = `<p class="tit">26/10/13(화)</p><div class="view-txt">
    &lt;조식&gt;<img src="/upload/editor/breakfast.jpg">
    &lt;중식&gt;<img src="https://www.e-mirim.hs.kr/upload/editor/lunch.jpg">
    &lt;석식&gt;<img src="https://example.com/dinner.jpg"></div>`;
  assert.equal(findPhoto(html, '2026-10-13', '2'), 'https://www.e-mirim.hs.kr/upload/editor/lunch.jpg');
  assert.equal(findPhoto(html, '2026-10-12', '2'), null);
  assert.equal(findPhoto(html, '2026-10-13', '3'), null);
});
test('급식 없음과 API 오류를 구분한다', () => {
  assert.equal(readMeal({ RESULT: { CODE: 'INFO-200' } }), null);
  assert.throws(() => readMeal({ RESULT: { CODE: 'ERROR-300' } }));
  assert.deepEqual(readMeal({ mealServiceDietInfo: [{ head: [{ RESULT: { CODE: 'INFO-000' } }] }, { row: [{ DDISH_NM: '밥' }] }] }), { DDISH_NM: '밥' });
});
