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

// 선택한 리뷰와 정렬 기준을 변수로 관리합니다.
let selectedReviewId = null;
let activeSort = "최신순";

function sortReviews(sortType) {
    activeSort = sortType;
    const sorted = [...reviewData];
    if (sortType === "별점 높은순") {
        sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortType === "오래된 순") {
        sorted.sort((a, b) => a.createdAt - b.createdAt);
    } else {
        sorted.sort((a, b) => b.createdAt - a.createdAt);
    }
    renderReviews(sorted);
}

function openModal(id) {
    const review = reviewData.find(item => item.id === id);
    if (!review) return;
    selectedReviewId = id;
    document.getElementById("modalMenuTitle").textContent = review.menuName;
    document.getElementById("modalRatingText").textContent = review.rating.toFixed(1) + " / 5.0";
    document.getElementById("modalReviewContent").textContent = "“" + review.text + "”";
    document.getElementById("modalMealDate").textContent = review.date;
    document.getElementById("modalAuthor").textContent = "작성자: " + review.author;
    document.getElementById("reviewModal").hidden = false;
}

function closeReviewModal() {
    document.getElementById("reviewModal").hidden = true;
    selectedReviewId = null;
}

function selectReviewSort(id, sortType, left, width) {
    document.getElementById("sortLatest").className = "text-wrapper-15 sort-btn";
    document.getElementById("sortRating").className = "text-wrapper-16 sort-btn";
    document.getElementById("sortOldest").className = "text-wrapper-14 sort-btn";
    document.getElementById(id).className += " active";
    document.getElementById("sortHighlight").style.left = left + "px";
    document.getElementById("sortHighlight").style.width = width + "px";
    sortReviews(sortType);
}

// id가 있는 요소를 선택하고 onclick에 함수를 넣습니다.
document.getElementById("sortLatest").onclick = function () {
    selectReviewSort("sortLatest", "최신순", 4, 56);
};
document.getElementById("sortRating").onclick = function () {
    selectReviewSort("sortRating", "별점 높은순", 68, 83);
};
document.getElementById("sortOldest").onclick = function () {
    selectReviewSort("sortOldest", "오래된 순", 145, 71);
};
document.getElementById("closeModal").onclick = closeReviewModal;
document.getElementById("reviewModalBackground").onclick = closeReviewModal;

document.getElementById("deleteReviewBtn").onclick = function () {
    if (selectedReviewId === null) return;
    if (confirm("정말로 이 리뷰를 삭제하시겠습니까?")) {
        reviewData = reviewData.filter(item => item.id !== selectedReviewId);
        sortReviews(activeSort);
        closeReviewModal();
    }
};
document.getElementById("editReviewBtn").onclick = function () {
    const review = reviewData.find(item => item.id === selectedReviewId);
    if (!review) return;
    const text = prompt("수정할 리뷰 내용을 입력하세요:", review.text);
    if (text && text.trim() !== "") {
        review.text = text.trim();
        document.getElementById("modalReviewContent").textContent = "“" + review.text + "”";
        sortReviews(activeSort);
    }
};
document.getElementById("searchBtn").onclick = function () {
    const keyword = prompt("검색할 메뉴 이름을 입력하세요:");
    if (keyword) {
        renderReviews(reviewData.filter(item => item.menuName.includes(keyword)));
    }
};
document.getElementById("writeBtn").onclick = function () {
    const menuName = prompt("메뉴 이름을 입력하세요:");
    if (!menuName || menuName.trim() === "") return;
    const text = prompt("리뷰 내용을 입력하세요:");
    if (!text || text.trim() === "") return;
    const now = new Date();
    reviewData.unshift({
        id: now.getTime(),
        menuName: menuName.trim(),
        text: text.trim(),
        rating: 5.0,
        author: "2407 사용자",
        time: "방금 전",
        date: now.getFullYear() + "-" + (now.getMonth() + 1).toString().padStart(2, "0") +
            "-" + now.getDate().toString().padStart(2, "0") + " 식사 이용",
        createdAt: now
    });
    selectReviewSort("sortLatest", "최신순", 4, 56);
    alert("리뷰가 등록되었습니다!");
};
document.getElementById("rankBtn").onclick = function () {
    alert("이번주 최고 인기 메뉴 순위:\n1위: 마라탕 (★ 4.9)\n2위: 치즈닭갈비 (★ 4.7)");
};

// 키보드로도 기존 버튼을 누를 수 있도록 합니다.
const reviewButtonIds = ["sortLatest", "sortRating", "sortOldest", "searchBtn", "writeBtn", "rankBtn"];
for (const id of reviewButtonIds) {
    const button = document.getElementById(id);
    button.onkeydown = function (event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            button.onclick();
        }
    };
}
