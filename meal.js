// 팀원이 만든 화면에도 아래 id를 유지하면 이 파일을 그대로 연결할 수 있습니다.
(() => {
  const form = document.getElementById('mealForm');
  if (!form) return;
  const dateInput = document.getElementById('mealDate');
  const typeInput = document.getElementById('mealType');
  const menu = document.getElementById('mealMenu');
  const details = document.getElementById('mealDetails');
  const image = document.getElementById('mealImage');
  const placeholder = document.getElementById('photoPlaceholder');
  const photoStatus = document.getElementById('photoStatus');
  const source = document.getElementById('photoSource');
  const board = 'https://www.e-mirim.hs.kr/schoollife/food.do';
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const part = name => parts.find(item => item.type === name).value;
  dateInput.value = `${part('year')}-${part('month')}-${part('day')}`;
  let activeRequest;
  let generation = 0;

  // API의 <br/>만 줄바꿈으로 바꾸고, HTML을 실행하지 않고 문자로 표시합니다.
  const lines = value => (value || '').replace(/<br\s*\/?\s*>/gi, '\n');
  async function request(path, query, signal) {
    const response = await fetch(`${path}?${query}`, { signal });
    if (!response.ok) throw new Error('조회 실패');
    return response.json();
  }

  async function load() {
    if (!form.reportValidity()) return;
    activeRequest?.abort();
    activeRequest = new AbortController();
    const { signal } = activeRequest;
    const current = ++generation;
    const date = dateInput.value;
    const mealName = typeInput.selectedOptions[0].textContent;
    const query = new URLSearchParams({ date, mealType: typeInput.value });
    document.getElementById('todayDate').textContent = new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
    }).format(new Date(`${date}T12:00:00+09:00`));
    menu.textContent = `${mealName} 메뉴를 불러오는 중입니다.`;
    details.hidden = true;
    document.getElementById('mealCalories').textContent = '';
    image.onload = image.onerror = null;
    image.hidden = true;
    image.removeAttribute('src');
    placeholder.hidden = false;
    photoStatus.textContent = '학교 홈페이지에서 사진을 불러오는 중입니다.';
    source.href = board;
    if (location.protocol === 'file:') {
      menu.textContent = '터미널에서 npm start 실행 후 http://localhost:3000으로 접속해주세요.';
      photoStatus.textContent = '사진 조회에는 서버 실행이 필요합니다.';
      return;
    }
    // 메뉴와 사진을 따로 요청하여 사진 게시판 오류가 메뉴 조회를 막지 않게 합니다.
    await Promise.allSettled([
      request('/api/meal', query, signal).then(({ meal }) => {
        if (current !== generation) return;
        menu.textContent = meal ? lines(meal.menu) : `${date} ${mealName} 급식 정보가 없습니다.`;
        if (!meal) return;
        document.getElementById('mealCalories').textContent = meal.calories || '';
        document.getElementById('mealOrigin').textContent = lines(meal.origin);
        document.getElementById('mealNutrition').textContent = lines(meal.nutrition);
        details.hidden = false;
      }).catch(error => {
        if (error.name !== 'AbortError' && current === generation) menu.textContent = '급식을 불러오지 못했습니다. 다시 시도해주세요.';
      }),
      request('/api/photo', query, signal).then(photo => {
        if (current !== generation) return;
        source.href = photo.source || board;
        if (!photo.image) {
          photoStatus.textContent = '선택한 날짜와 식사의 사진이 아직 게시되지 않았습니다.';
          return;
        }
        // 요청별 이미지를 사용하여 이전 날짜의 늦은 로딩이 현재 화면을 바꾸지 않게 합니다.
        const pending = new Image();
        pending.onload = () => {
          if (current !== generation) return;
          image.src = photo.image;
          image.alt = `미림마이스터고 ${date} ${mealName} 급식 사진`;
          image.hidden = false;
          placeholder.hidden = true;
        };
        pending.onerror = () => {
          if (current === generation) photoStatus.textContent = '사진을 표시하지 못했습니다. 아래 출처 링크에서 확인해주세요.';
        };
        pending.src = photo.image;
      }).catch(error => {
        if (error.name !== 'AbortError' && current === generation) photoStatus.textContent = '사진 조회에 실패했습니다. 다시 시도하거나 출처 링크를 확인해주세요.';
      })
    ]);
  }
  form.addEventListener('submit', event => { event.preventDefault(); load(); });
  dateInput.addEventListener('change', load);
  typeInput.addEventListener('change', load);
  load();
})();
