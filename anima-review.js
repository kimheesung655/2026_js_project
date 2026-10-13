// 수업의 카페 주문 예제처럼 배열을 읽어 화면에 표시합니다.
let displayedReviews = [];
let reviewPage = 1;

function renderReviews(data) {
    displayedReviews = data;
    reviewPage = 1;
    renderReviewPage();
}

function changeReviewPage(number) {
    reviewPage = number;
    renderReviewPage();
}

function renderReviewPage() {
    const visibleReviews = displayedReviews.slice((reviewPage - 1) * 4, reviewPage * 4);
    for (let index = 0; index < 4; index++) {
        const slot = document.getElementById("reviewSlot" + index);
        const review = visibleReviews[index];
        if (!review) {
            slot.hidden = true;
            continue;
        }
        slot.hidden = false;
        document.getElementById("reviewText" + index).textContent = review.text;
        document.getElementById("reviewMeta" + index).textContent = "작성자: " + review.author + " · " + review.time;
        document.getElementById("reviewRating" + index).textContent = review.rating.toFixed(1);
        slot.onclick = function () { openModal(review.id); };
        slot.onkeydown = function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openModal(review.id);
            }
        };
    }
    const pageCount = Math.max(1, Math.ceil(displayedReviews.length / 4));
    const pageButtons = [];
    for (let number = 1; number <= pageCount; number++) {
        let buttonClass = "";
        if (number === reviewPage) buttonClass = "selected-page";
        // 넣는 값은 계산한 번호뿐이며 리뷰 내용은 textContent로 표시합니다.
        pageButtons.push('<button class="' + buttonClass + '" aria-label="' + number +
            '페이지" onclick="changeReviewPage(' + number + ')">' + number + '</button>');
    }
    document.getElementById("reviewPagination").innerHTML = pageButtons.join("");
}

sortReviews("최신순");
