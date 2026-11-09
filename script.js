let reviewData = [];
let selectedReviewId = null;
let activeSort = "최신순";

function reviewTime(value) {
    const minutes = Math.floor((new Date().getTime() - new Date(value).getTime()) / 60000);
    if (minutes < 1) return "방금 전";
    if (minutes < 60) return minutes + "분 전";
    if (minutes < 1440) return Math.floor(minutes / 60) + "시간 전";
    return Math.floor(minutes / 1440) + "일 전";
}

function rowToReview(row) {
    const profile = row.profiles || {};
    const student = profile.student_number ? profile.student_number + " " : "";
    return { id: row.id, userId: row.user_id, menuName: row.menu_name, text: row.content,
        rating: Number(row.rating), author: student + (profile.name || "사용자"), time: reviewTime(row.created_at),
        date: row.meal_date + " " + row.meal_type + " 이용", createdAt: new Date(row.created_at) };
}

function showPopularMenus(rows) {
    const menus = [];
    for (const row of rows) {
        let menu = menus.find(item => item.menuName === row.menu_name);
        if (!menu) {
            menu = { menuName: row.menu_name, total: 0, count: 0, average: 0 };
            menus.push(menu);
        }
        menu.total += Number(row.rating);
        menu.count += 1;
    }
    for (const menu of menus) menu.average = menu.total / menu.count;
    menus.sort(function (a, b) {
        if (b.average !== a.average) return b.average - a.average;
        if (b.count !== a.count) return b.count - a.count;
        if (a.menuName < b.menuName) return -1;
        if (a.menuName > b.menuName) return 1;
        return 0;
    });
    for (let index = 0; index < 2; index += 1) {
        const menu = menus[index];
        document.getElementById("popularMenu" + index).textContent = menu ? (index + 1) + "위 " + menu.menuName : (index + 1) + "위 등록된 메뉴 없음";
        document.getElementById("popularScore" + index).textContent = menu ? menu.average.toFixed(1) : "-";
    }
}

function loadReviews() {
    const fields = "id,user_id,menu_name,rating,content,meal_date,meal_type,created_at,profiles(name,student_number)";
    supabaseRequest("/rest/v1/reviews?select=" + fields + "&order=created_at.desc", "GET", null, false, function (error, rows) {
        if (error) {
            reviewData = [];
            renderReviews([]);
            showPopularMenus([]);
            return console.log("리뷰 불러오기 실패: " + error);
        }
        showPopularMenus(rows || []);
        reviewData = (rows || []).map(rowToReview);
        sortReviews(activeSort);
    });
}

function sortReviews(sortType) {
    activeSort = sortType;
    const sorted = [...reviewData];
    if (sortType === "별점 높은순") sorted.sort((a, b) => b.rating - a.rating);
    else if (sortType === "오래된 순") sorted.sort((a, b) => a.createdAt - b.createdAt);
    else sorted.sort((a, b) => b.createdAt - a.createdAt);
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
    const session = currentSession();
    const mine = session && session.user && session.user.id === review.userId;
    document.getElementById("editReviewBtn").hidden = !mine;
    document.getElementById("deleteReviewBtn").hidden = !mine;
    document.getElementById("reviewModal").hidden = false;
}

function closeReviewModal() { document.getElementById("reviewModal").hidden = true; selectedReviewId = null; }

function selectReviewSort(id, sortType, left, width) {
    document.getElementById("sortLatest").className = "text-wrapper-15 sort-btn";
    document.getElementById("sortRating").className = "text-wrapper-16 sort-btn";
    document.getElementById("sortOldest").className = "text-wrapper-14 sort-btn";
    document.getElementById(id).className += " active";
    document.getElementById("sortHighlight").style.left = left + "px";
    document.getElementById("sortHighlight").style.width = width + "px";
    sortReviews(sortType);
}

document.getElementById("sortLatest").onclick = function () { selectReviewSort("sortLatest", "최신순", 4, 56); };
document.getElementById("sortRating").onclick = function () { selectReviewSort("sortRating", "별점 높은순", 60, 84); };
document.getElementById("sortOldest").onclick = function () { selectReviewSort("sortOldest", "오래된 순", 144, 72); };
document.getElementById("closeModal").onclick = closeReviewModal;
document.getElementById("reviewModalBackground").onclick = closeReviewModal;

document.getElementById("deleteReviewBtn").onclick = function () {
    if (selectedReviewId === null || !confirm("정말로 이 리뷰를 삭제하시겠습니까?")) return;
    supabaseRequest("/rest/v1/reviews?id=eq." + selectedReviewId, "DELETE", null, true, function (error) {
        if (error) return alert(error);
        closeReviewModal(); loadReviews();
    });
};
document.getElementById("editReviewBtn").onclick = function () {
    const review = reviewData.find(item => item.id === selectedReviewId);
    if (!review) return;
    const text = prompt("수정할 리뷰 내용을 입력하세요:", review.text);
    if (!text || text.trim() === "") return;
    supabaseRequest("/rest/v1/reviews?id=eq." + selectedReviewId, "PATCH", { content: text.trim() }, true, function (error) {
        if (error) return alert(error);
        closeReviewModal(); loadReviews();
    });
};
document.getElementById("searchBtn").onclick = function () { location.href = "search.html"; };
document.getElementById("writeBtn").onclick = function () {
    if (!currentSession()) { alert("리뷰를 작성하려면 먼저 로그인해 주세요."); location.href = "login.html"; return; }
    location.href = "write.html";
};
document.getElementById("rankBtn").onclick = function () { location.href = "rank.html"; };

const reviewButtonIds = ["sortLatest", "sortRating", "sortOldest", "searchBtn", "writeBtn", "rankBtn"];
for (const id of reviewButtonIds) {
    const button = document.getElementById(id);
    button.onkeydown = function (event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); button.onclick(); } };
}

loadReviews();
