// 팀원의 리뷰 데이터·수정·삭제 로직을 Anima에서 생성한 네 개의 리뷰 슬롯에 연결합니다.
(() => {
  const slots = ['frame-7', 'frame-6', 'frame-4', 'frame-5'].map(name => document.querySelector(`.element .${name}`));
  let currentData = [];
  let page = 1;
  const pagination = document.querySelector('.element .div-2');
  function renderPage() {
    const visible = currentData.slice((page - 1) * 4, page * 4);
    slots.forEach((slot, index) => {
      const review = visible[index];
      slot.hidden = !review;
      if (!review) return;
      slot.querySelector('.text-wrapper-12').textContent = review.text;
      slot.querySelector('.text-wrapper-11').textContent = `작성자: ${review.author} · ${review.time}`;
      slot.querySelector('.text-wrapper-13').textContent = review.rating.toFixed(1);
      slot.setAttribute('role', 'button');
      slot.tabIndex = 0;
      slot.onclick = () => openModal(review.id);
      slot.onkeydown = event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openModal(review.id); }
      };
    });
    pagination.replaceChildren();
    const total = Math.max(1, Math.ceil(currentData.length / 4));
    for (let number = 1; number <= total; number++) {
      const button = document.createElement('button');
      button.textContent = number;
      button.className = number === page ? 'selected-page' : '';
      button.setAttribute('aria-label', `${number}페이지`);
      button.onclick = () => { page = number; renderPage(); };
      pagination.append(button);
    }
  }
  renderReviews = data => { currentData = data; page = 1; renderPage(); };
  document.querySelectorAll('.element [role="button"]').forEach(element => {
    element.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); element.click(); }
    });
  });
  document.querySelectorAll('.element .sort-btn').forEach(button => {
    button.addEventListener('click', () => {
      const highlight = document.querySelector('.element .rectangle-9');
      highlight.style.left = `${Math.max(3, button.offsetLeft - 8)}px`;
      highlight.style.width = `${button.offsetWidth + 16}px`;
    });
  });
})();
