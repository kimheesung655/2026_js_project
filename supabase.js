let supabaseConfig = null;
let supabaseWaiting = [];

function readSession() {
    const saved = localStorage.getItem("mealSession");
    if (!saved) return null;
    try {
        return JSON.parse(saved);
    } catch (error) {
        localStorage.removeItem("mealSession");
        return null;
    }
}

function saveSession(session, remember) {
    if (remember === false) {
        sessionStorage.setItem("mealSession", JSON.stringify(session));
        localStorage.removeItem("mealSession");
    } else {
        localStorage.setItem("mealSession", JSON.stringify(session));
        sessionStorage.removeItem("mealSession");
    }
}

function currentSession() {
    const local = readSession();
    if (local) return local;
    const saved = sessionStorage.getItem("mealSession");
    if (!saved) return null;
    try {
        return JSON.parse(saved);
    } catch (error) {
        sessionStorage.removeItem("mealSession");
        return null;
    }
}

function loadSupabaseConfig(callback) {
    if (supabaseConfig) return callback(null, supabaseConfig);
    supabaseWaiting.push(callback);
    if (supabaseWaiting.length > 1) return;

    const request = new XMLHttpRequest();
    request.open("GET", "/api/config");
    request.onload = function () {
        let error = null;
        if (request.status === 200) {
            supabaseConfig = JSON.parse(request.responseText);
        } else {
            error = "Supabase 설정을 불러오지 못했습니다.";
        }
        const callbacks = supabaseWaiting;
        supabaseWaiting = [];
        for (const item of callbacks) item(error, supabaseConfig);
    };
    request.onerror = function () {
        const callbacks = supabaseWaiting;
        supabaseWaiting = [];
        for (const item of callbacks) item("서버에 연결하지 못했습니다.");
    };
    request.send();
}

function supabaseRequest(path, method, body, useLogin, callback, extraHeaders) {
    loadSupabaseConfig(function (configError, config) {
        if (configError) return callback(configError);
        const request = new XMLHttpRequest();
        request.open(method, config.supabaseUrl + path);
        request.setRequestHeader("apikey", config.supabaseKey);
        request.setRequestHeader("Content-Type", "application/json");
        const session = currentSession();
        if (useLogin && session && session.access_token) {
            request.setRequestHeader("Authorization", "Bearer " + session.access_token);
        }
        if (extraHeaders) {
            for (const name in extraHeaders) request.setRequestHeader(name, extraHeaders[name]);
        }
        request.onload = function () {
            let data = null;
            if (request.responseText) {
                try { data = JSON.parse(request.responseText); } catch (error) { data = null; }
            }
            if (request.status >= 200 && request.status < 300) callback(null, data, request);
            else callback((data && (data.message || data.error_description || data.hint)) || "요청에 실패했습니다.", data, request);
        };
        request.onerror = function () { callback("Supabase에 연결하지 못했습니다."); };
        request.send(body ? JSON.stringify(body) : null);
    });
}

function signOut() {
    localStorage.removeItem("mealSession");
    sessionStorage.removeItem("mealSession");
    location.href = "index.html";
}
