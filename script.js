

const searchBtn = document.getElementById("searchBtn");
const writeBtn = document.getElementById("writeBtn");
const rankBtn = document.getElementById("rankBtn");

const reviewModal = document.getElementById("reviewModal");
const closeModal = document.getElementById("closeModal");
const modalBg = document.querySelector(".modal-bg");


// 메뉴 검색 버튼
searchBtn.addEventListener("click", () => {
    alert("메뉴 검색 화면은 다음 단계에서 구현합니다.");
});


// 리뷰쓰기 버튼
writeBtn.addEventListener("click", () => {
    alert("리뷰 작성 화면은 다음 단계에서 구현합니다.");
});


// 전체 순위 보기
rankBtn.addEventListener("click", () => {
    alert("인기 메뉴 TOP 5 화면은 다음 단계에서 구현합니다.");
});


// 리뷰 카드 클릭 → 상세 모달
const reviewCards = document.querySelectorAll(".review-card");

reviewCards.forEach((card) => {
    card.addEventListener("click", () => {
        reviewModal.classList.remove("hidden");
    });
});


// 모달 닫기
function closeReviewModal() {
    reviewModal.classList.add("hidden");
}

closeModal.addEventListener("click", closeReviewModal);
modalBg.addEventListener("click", closeReviewModal);


// 정렬 버튼
const sortButtons = document.querySelectorAll(".sort-btn");

sortButtons.forEach((button) => {
    button.addEventListener("click", () => {

        sortButtons.forEach((btn) => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        // 실제 정렬 기능은 이후 localStorage 데이터와 연결
        console.log("선택한 정렬:", button.textContent);
    });
});


// ===============================
// 나중에 사용할 리뷰 데이터 구조
// ===============================

/*
const review = {
    id: Date.now(),
    date: "2026-07-19",
    mealType: "중식",
    menu: "마라탕",
    rating: 5,
    content: "마라탕 맛있어요!",
    author: "2407 김희성"
};


// localStorage 저장 예시

const reviews = [];

localStorage.setItem(
    "reviews",
    JSON.stringify(reviews)
);


// localStorage 불러오기

const savedReviews = JSON.parse(
    localStorage.getItem("reviews")
) || [];
*/
