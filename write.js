const session = currentSession();
if (!session || !session.user) {
    alert("로그인 후 리뷰를 작성할 수 있습니다.");
    location.href = "login.html";
} else {
    const now = new Date();
    document.getElementById("mealDate").value = now.getFullYear() + "-" + (now.getMonth() + 1).toString().padStart(2, "0") + "-" + now.getDate().toString().padStart(2, "0");
}

document.getElementById("reviewForm").onsubmit = function (event) {
    event.preventDefault();
    const message = document.getElementById("formMessage");
    message.textContent = "등록 중입니다.";
    const review = { user_id: session.user.id, menu_name: document.getElementById("menuName").value.trim(),
        rating: Number(document.getElementById("rating").value), content: document.getElementById("content").value.trim(),
        meal_date: document.getElementById("mealDate").value, meal_type: "중식" };
    supabaseRequest("/rest/v1/reviews", "POST", review, true, function (error) {
        if (error) { message.textContent = error; message.className = "form-message error"; return; }
        location.href = "index.html";
    }, { "Prefer": "return=minimal" });
};
