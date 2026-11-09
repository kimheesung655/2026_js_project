function showAuthMessage(message, isError) {
    const element = document.getElementById("formMessage");
    element.textContent = message;
    element.className = isError ? "form-message error" : "form-message success";
}

function saveProfile(user, callback) {
    const metadata = user.user_metadata || {};
    supabaseRequest("/rest/v1/profiles?id=eq." + user.id + "&select=id&limit=1", "GET", null, true, function (profileError, profiles) {
        if (profileError) return callback(profileError);
        if (profiles && profiles[0]) return callback(null);
        supabaseRequest("/rest/v1/schools?school_code=eq.7011569&select=id&limit=1", "GET", null, true, function (schoolError, schools) {
            if (schoolError) return callback(schoolError);
            const profile = { id: user.id, name: metadata.name || "사용자", student_number: metadata.student_number || "", school_id: schools && schools[0] ? schools[0].id : null };
            supabaseRequest("/rest/v1/profiles", "POST", profile, true, callback, { "Prefer": "return=minimal" });
        });
    });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) loginForm.onsubmit = function (event) {
    event.preventDefault();
    showAuthMessage("로그인 중입니다.", false);
    const body = { email: document.getElementById("email").value.trim(), password: document.getElementById("password").value };
    supabaseRequest("/auth/v1/token?grant_type=password", "POST", body, false, function (error, data) {
        if (error) return showAuthMessage(error, true);
        saveSession(data, document.getElementById("rememberLogin").checked);
        saveProfile(data.user, function (profileError) {
            if (profileError) return showAuthMessage("로그인은 됐지만 프로필 저장에 실패했습니다: " + profileError, true);
            location.href = "index.html";
        });
    });
};

const signupForm = document.getElementById("signupForm");
if (signupForm) signupForm.onsubmit = function (event) {
    event.preventDefault();
    const password = document.getElementById("password").value;
    if (password !== document.getElementById("passwordCheck").value) return showAuthMessage("비밀번호가 서로 다릅니다.", true);
    showAuthMessage("회원가입 중입니다.", false);
    const body = { email: document.getElementById("email").value.trim(), password: password, data: { name: document.getElementById("name").value.trim(), student_number: document.getElementById("studentNumber").value.trim() } };
    supabaseRequest("/auth/v1/signup", "POST", body, false, function (error, data) {
        if (error) return showAuthMessage(error, true);
        if (!data.access_token) return showAuthMessage("가입 확인 메일을 보냈습니다. 이메일 확인 후 로그인해 주세요.", false);
        saveSession(data, true);
        saveProfile(data.user, function (profileError) {
            if (profileError) return showAuthMessage("가입은 됐지만 프로필 저장에 실패했습니다: " + profileError, true);
            location.href = "index.html";
        });
    });
};
