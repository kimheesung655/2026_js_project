// 1. 초기 더미 데이터
let reviewData = [
    {
        id: 1,
        menuName: "리코타치즈샐러드",
        text: "치즈가 엄청 꾸덕꾸덕하고 발사믹 소스랑 잘 어울려요!",
        rating: 4.0,
        author: "2407 김희성",
        time: "7분 전",
        date: "2026-07-16 식사 이용",
        createdAt: new Date("2026-07-16T12:00:00")
    },
    {
        id: 2,
        menuName: "랍스터테일구이",
        text: "급식에 진짜 랍스터가 나오다니 영양사 선생님 최고입니다! 너무 맛있고 고급스러운 느낌이에요.",
        rating: 5.0,
        author: "2406 노가우",
        time: "10분 전",
        date: "2026-07-16 식사 이용",
        createdAt: new Date("2026-07-16T11:53:00")
    },
    {
        id: 3,
        menuName: "바비큐폭립",
        text: "고기가 부드럽고 양념이 잘 베어있어서 밥이랑 같이 먹기 딱 좋았습니다.",
        rating: 4.5,
        author: "2401 이영희",
        time: "25분 전",
        date: "2026-07-16 식사 이용",
        createdAt: new Date("2026-07-16T11:38:00")
    },
    {
        id: 4,
        menuName: "치즈매쉬포테이토",
        text: "치즈와 감자의 조합이 부드럽고 고소해서 사이드로 먹기 최고였어요.",
        rating: 3.5,
        author: "2410 박철수",
        time: "1시간 전",
        date: "2026-07-16 식사 이용",
        createdAt: new Date("2026-07-16T11:00:00")
    }
];

let selectedReviewId = null;

// 2. DOM 요소 참조
const reviewListContainer = document.getElementById("reviewList");
const sortButtons = document.querySelectorAll(".sort-buttons .sort-btn");

// 리뷰 상세 모달
const reviewModal = document.getElementById("reviewModal");
const closeModalBtn = document.getElementById("closeModal");
const modalBg = reviewModal ? reviewModal.querySelector(".modal-bg") : null;

const modalMenuTitle = reviewModal ? reviewModal.querySelector("h2") : null;
const modalRatingText = reviewModal ? reviewModal.querySelector(".modal-rating strong") : null;
const modalReviewContent = reviewModal ? reviewModal.querySelector(".modal-review") : null;
const modalInfoSpans = reviewModal ? reviewModal.querySelectorAll(".modal-info span") : null;

const deleteBtn = reviewModal ? reviewModal.querySelector(".delete-btn") : null;
const editBtn = reviewModal ? reviewModal.querySelector(".edit-btn") : null;

// 인증 모달
const authModal = document.getElementById("authModal");
const loginBtn = document.getElementById("loginBtn");
const closeAuthModalBtn = document.getElementById("closeAuthModal");
const authModalBg = document.getElementById("authModalBg");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const toSignupLink = document.getElementById("toSignup");
const toLoginLink = document.getElementById("toLogin");

// 기타 버튼
const homeBtn = document.getElementById("homeBtn");
const searchBtn = document.getElementById("searchBtn");
const writeBtn = document.getElementById("writeBtn");
const rankBtn = document.getElementById("rankBtn");

// 댓글 요소
const commentInput = document.getElementById("commentInput");
const addCommentBtn = document.getElementById("addCommentBtn");
const commentList = document.getElementById("commentList");

// 3. 리뷰 목록 렌더링
function renderReviews(data) {
    if (!reviewListContainer) return;
    reviewListContainer.innerHTML = "";

    data.forEach((review) => {
        const card = document.createElement("article");
        card.className = "review-card";
        card.dataset.id = review.id;

        card.innerHTML = `
            <p class="review-text">${review.text}</p>
            <span class="review-rating">★ <b>${review.rating.toFixed(1)}</b></span>
            <span class="review-meta">작성자: ${review.author} · ${review.time}</span>
        `;

        card.addEventListener("click", () => openModal(review.id));
        reviewListContainer.appendChild(card);
    });
}

// 4. 정렬
function sortReviews(sortType) {
    let sorted = [...reviewData];

    if (sortType === "최신순") {
        sorted.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortType === "별점 높은순") {
        sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortType === "오래된 순") {
        sorted.sort((a, b) => a.createdAt - b.createdAt);
    }

    renderReviews(sorted);
}

sortButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        sortButtons.forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
        sortReviews(e.target.innerText.trim());
    });
});

// 5. 상세 모달 제어
function openModal(id) {
    const review = reviewData.find((r) => r.id === id);
    if (!review || !reviewModal) return;

    selectedReviewId = id;
    modalMenuTitle.innerText = review.menuName;
    modalRatingText.innerText = `★★★★★ ${review.rating.toFixed(1)} / 5.0`;
    modalReviewContent.innerText = `“${review.text}”`;
    modalInfoSpans[0].innerText = review.date;
    modalInfoSpans[1].innerText = `작성자: ${review.author}`;

    reviewModal.classList.remove("hidden");
}

function closeModal() {
    if (reviewModal) reviewModal.classList.add("hidden");
    selectedReviewId = null;
}

if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
if (modalBg) modalBg.addEventListener("click", closeModal);

// 6. 삭제 & 수정
if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
        if (selectedReviewId === null) return;
        if (confirm("정말로 이 리뷰를 삭제하시겠습니까?")) {
            reviewData = reviewData.filter((r) => r.id !== selectedReviewId);
            const activeSort = document.querySelector(".sort-btn.active")?.innerText.trim() || "최신순";
            sortReviews(activeSort);
            closeModal();
        }
    });
}

if (editBtn) {
    editBtn.addEventListener("click", () => {
        if (selectedReviewId === null) return;
        const review = reviewData.find((r) => r.id === selectedReviewId);
        const newText = prompt("수정할 리뷰 내용을 입력하세요:", review.text);

        if (newText && newText.trim() !== "") {
            review.text = newText.trim();
            modalReviewContent.innerText = `“${review.text}”`;
            const activeSort = document.querySelector(".sort-btn.active")?.innerText.trim() || "최신순";
            sortReviews(activeSort);
        }
    });
}

// 7. 로그인/회원가입 모달
if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        if (loginBtn.innerText === "로그아웃") {
            alert("로그아웃 되었습니다.");
            loginBtn.innerText = "로그인";
            return;
        }
        authModal.classList.remove("hidden");
        loginForm.classList.remove("hidden");
        signupForm.classList.add("hidden");
    });
}

function closeAuthModal() {
    if (authModal) authModal.classList.add("hidden");
}

if (closeAuthModalBtn) closeAuthModalBtn.addEventListener("click", closeAuthModal);
if (authModalBg) authModalBg.addEventListener("click", closeAuthModal);

if (toSignupLink) {
    toSignupLink.addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.classList.add("hidden");
        signupForm.classList.remove("hidden");
    });
}

if (toLoginLink) {
    toLoginLink.addEventListener("click", (e) => {
        e.preventDefault();
        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const loginId = document.getElementById("loginId").value;
        alert(`${loginId}님 환영합니다!`);
        loginBtn.innerText = "로그아웃";
        closeAuthModal();
    });
}

if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("회원가입이 완료되었습니다! 로그인해 주세요.");
        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");
    });
}

// 8. 기타 기능
if (homeBtn) {
    homeBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

if (searchBtn) {
    searchBtn.addEventListener("click", () => {
        const keyword = prompt("검색할 메뉴 이름을 입력하세요:");
        if (keyword) {
            const filtered = reviewData.filter((r) => r.menuName.includes(keyword));
            renderReviews(filtered);
        }
    });
}

if (writeBtn) {
    writeBtn.addEventListener("click", () => {
        const menuName = prompt("메뉴 이름을 입력하세요:");
        if (!menuName) return;

        const text = prompt("리뷰 내용을 입력하세요:");
        if (!text) return;

        const newReview = {
            id: Date.now(),
            menuName: menuName,
            text: text,
            rating: 5.0,
            author: "2407 사용자",
            time: "방금 전",
            date: "2026-07-16 식사 이용",
            createdAt: new Date()
        };

        reviewData.unshift(newReview);
        sortReviews("최신순");
        alert("리뷰가 등록되었습니다!");
    });
}

if (rankBtn) {
    rankBtn.addEventListener("click", () => {
        alert("이번주 최고 인기 메뉴 순위:\n1위: 마라탕 (★ 4.9)\n2위: 치즈닭갈비 (★ 4.7)");
    });
}

// 9. 댓글 등록
if (addCommentBtn && commentInput && commentList) {
    addCommentBtn.addEventListener("click", () => {
        const text = commentInput.value.trim();
        if (!text) {
            alert("댓글을 입력해주세요.");
            return;
        }

        const item = document.createElement("div");
        item.className = "comment-item";
        item.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">2407 사용자</span>
                <span class="comment-time">방금 전</span>
            </div>
            <div class="comment-body">${text}</div>
        `;

        commentList.appendChild(item);
        commentInput.value = "";
    });
}

// 초기화
document.addEventListener("DOMContentLoaded", () => {
    sortReviews("최신순");
});
