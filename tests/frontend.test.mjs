// 단순화한 코드가 기존 기능을 유지하는지 확인하는 개발용 테스트입니다.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function page() {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const elements = {};
  for (const match of html.matchAll(/\bid="([^"]+)"/g)) {
    elements[match[1]] = { value: '', textContent: '', innerHTML: '', hidden: false, style: {},
      focus() {}, removeAttribute(name) { delete this[name]; } };
  }
  elements.mealType.value = '2';
  const requests = [];
  class Request {
    open(method, url) { this.method = method; this.url = url; }
    send() { requests.push(this); }
    respond(data, status = 200) {
      this.status = status;
      this.responseText = JSON.stringify(data);
      this.onload();
    }
  }
  const context = vm.createContext({
    document: { getElementById(id) { assert.ok(elements[id], `존재하는 id: ${id}`); return elements[id]; } },
    XMLHttpRequest: Request, location: { protocol: 'http:' }, alert() {}, confirm: () => true,
    prompt: () => null
  });
  for (const file of ['script.js', 'anima-review.js', 'meal.js']) {
    vm.runInContext(readFileSync(new URL('../' + file, import.meta.url), 'utf8'), context);
  }
  return { elements, requests, context, run: code => vm.runInContext(code, context) };
}

test('사진 조회가 실패해도 메뉴·영양 정보를 표시한다', () => {
  const app = page();
  app.requests[0].respond({ meal: { menu: '밥<br/>국', calories: '600 Kcal', origin: '국내산', nutrition: '단백질' } });
  app.requests[1].onerror();
  assert.equal(app.elements.mealMenu.textContent, '밥, 국');
  assert.equal(app.elements.mealDetails.hidden, false);
  assert.equal(app.elements.mealCalories.textContent, '600 Kcal');
  assert.match(app.elements.photoStatus.textContent, /실패/);
});

test('늦게 도착한 이전 날짜 응답은 현재 메뉴·사진을 덮어쓰지 않는다', () => {
  const app = page();
  app.elements.mealDate.value = '2026-10-13';
  app.run('loadMeal()');
  app.requests[2].respond({ meal: { menu: '현재 메뉴' } });
  app.requests[3].respond({ image: 'https://www.e-mirim.hs.kr/upload/current.jpg' });
  app.elements.mealImage.onload();
  app.requests[0].respond({ meal: { menu: '이전 메뉴' } });
  app.requests[1].respond({ image: 'https://www.e-mirim.hs.kr/upload/old.jpg' });
  assert.equal(app.elements.mealMenu.textContent, '현재 메뉴');
  assert.equal(app.elements.mealImage.src, 'https://www.e-mirim.hs.kr/upload/current.jpg');
  assert.equal(app.elements.photoPlaceholder.hidden, true);
});

test('급식 없음·시간 초과를 표시하고 빈 날짜는 요청하지 않는다', () => {
  const app = page();
  app.requests[0].respond({ meal: null });
  app.requests[1].respond({ image: null });
  assert.match(app.elements.mealMenu.textContent, /급식 정보가 없습니다/);
  assert.match(app.elements.photoStatus.textContent, /게시되지/);
  app.elements.mealDate.value = '';
  app.run('loadMeal()');
  assert.equal(app.requests.length, 2);
  assert.match(app.elements.mealMenu.textContent, /날짜를 선택/);
  app.elements.mealDate.value = '2026-10-13';
  app.run('loadMeal()');
  app.requests[2].ontimeout();
  assert.match(app.elements.mealMenu.textContent, /다시 시도/);
});

test('정렬·상세·삭제·페이지 이동과 리뷰 문자 표시를 유지한다', () => {
  const app = page();
  app.elements.sortRating.onclick();
  assert.equal(app.elements.reviewRating0.textContent, '5.0');
  app.elements.reviewSlot0.onclick();
  assert.equal(app.elements.modalMenuTitle.textContent, '랍스터테일구이');
  app.elements.deleteReviewBtn.onclick();
  assert.equal(app.elements.reviewRating0.textContent, '4.5');
  assert.equal(app.elements.reviewSlot3.hidden, true);
  app.run(`reviewData.push({ id: 90, text: '<img onerror="bad()">', author: '학생', time: '방금', rating: 2, createdAt: new Date(0) });
    reviewData.push({ id: 91, text: '다음 페이지', author: '학생', time: '방금', rating: 1, createdAt: new Date(0) });
    sortReviews('별점 높은순');`);
  assert.equal(app.elements.reviewText3.textContent, '<img onerror="bad()">');
  assert.match(app.elements.reviewPagination.innerHTML, /2페이지/);
  app.run('changeReviewPage(2)');
  assert.equal(app.elements.reviewText0.textContent, '다음 페이지');
});
