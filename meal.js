// 수업의 XMLHttpRequest 예제처럼 요청을 보내고 onload에서 결과를 표시합니다.
const mealDateInput = document.getElementById("mealDate");
const mealTypeInput = document.getElementById("mealType");
const mealMenu = document.getElementById("mealMenu");
const mealImage = document.getElementById("mealImage");
const mealDetails = document.getElementById("mealDetails");
const mealPlaceholder = document.getElementById("photoPlaceholder");
const mealPhotoStatus = document.getElementById("photoStatus");
const mealPhotoSource = document.getElementById("photoSource");
const schoolPhotoBoard = "https://www.e-mirim.hs.kr/schoollife/food.do";
let mealRequestNumber = 0;

function dateToInput(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return year + "-" + month + "-" + day;
}

function mealLines(text) {
    if (!text) return "";
    return text.replace(/<br\/>/g, "\n");
}

function closeMealPicker() {
    document.getElementById("mealPickerLayer").hidden = true;
    document.getElementById("mealPicker").focus();
}

function showMealPhoto(url, date, mealName, requestNumber) {
    mealImage.onload = function () {
        if (requestNumber !== mealRequestNumber) return;
        mealImage.hidden = false;
        mealPlaceholder.hidden = true;
    };
    mealImage.onerror = function () {
        if (requestNumber !== mealRequestNumber) return;
        mealImage.hidden = true;
        mealPlaceholder.hidden = false;
        mealPhotoStatus.textContent = "사진을 표시하지 못했습니다. 출처 링크를 확인해주세요.";
    };
    mealImage.alt = "미림마이스터고 " + date + " " + mealName + " 급식 사진";
    mealImage.src = url;
}

function loadMeal() {
    const date = mealDateInput.value;
    const mealType = mealTypeInput.value;
    // 조회 번호가 다르면 예전 요청이므로 화면을 바꾸지 않습니다.
    mealRequestNumber++;
    const requestNumber = mealRequestNumber;
    mealImage.onload = null;
    mealImage.onerror = null;
    mealImage.hidden = true;
    mealImage.removeAttribute("src");
    mealDetails.hidden = true;
    mealPlaceholder.hidden = false;
    mealPhotoSource.href = schoolPhotoBoard;
    if (date === "") {
        mealMenu.textContent = "급식 날짜를 선택해주세요.";
        mealPhotoStatus.textContent = "날짜를 선택하면 사진을 조회합니다.";
        return false;
    }
    if (!["1", "2", "3"].includes(mealType)) return false;
    const dateParts = date.split("-");
    const selectedDate = new Date(+dateParts[0], +dateParts[1] - 1, +dateParts[2]);
    if (dateToInput(selectedDate) !== date) return false;
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    document.getElementById("todayDate").textContent =
        selectedDate.getFullYear() + "년 " + (selectedDate.getMonth() + 1) + "월 " +
        selectedDate.getDate() + "일 (" + weekdays[selectedDate.getDay()] + ")";
    const mealNames = { "1": "조식", "2": "중식", "3": "석식" };
    const mealName = mealNames[mealType];
    mealMenu.textContent = mealName + " 메뉴를 불러오는 중입니다.";
    mealPhotoStatus.textContent = "학교 홈페이지에서 사진을 불러오는 중입니다.";
    if (location.protocol === "file:") {
        mealMenu.textContent = "npm start 실행 후 http://localhost:3000으로 접속해주세요.";
        mealPhotoStatus.textContent = "사진 조회에는 서버 실행이 필요합니다.";
        return false;
    }
    const query = "?date=" + date + "&mealType=" + mealType;
    const menuRequest = new XMLHttpRequest();
    menuRequest.open("GET", "/api/meal" + query);
    menuRequest.timeout = 20000;
    menuRequest.onload = function () {
        if (requestNumber !== mealRequestNumber) return;
        if (menuRequest.status === 200) {
            const result = JSON.parse(menuRequest.responseText);
            const meal = result.meal;
            if (!meal) {
                mealMenu.textContent = date + " " + mealName + " 급식 정보가 없습니다.";
                return;
            }
            mealMenu.textContent = mealLines(meal.menu).split("\n").join(", ");
            document.getElementById("mealCalories").textContent = meal.calories || "";
            document.getElementById("mealOrigin").textContent = mealLines(meal.origin);
            document.getElementById("mealNutrition").textContent = mealLines(meal.nutrition);
            mealDetails.hidden = false;
        } else {
            menuRequest.onerror();
        }
    };
    menuRequest.onerror = function () {
        if (requestNumber === mealRequestNumber) mealMenu.textContent = "급식을 불러오지 못했습니다. 다시 시도해주세요.";
    };
    menuRequest.ontimeout = menuRequest.onerror;
    menuRequest.send();

    // 메뉴와 사진은 따로 조회합니다. 사진 조회 실패가 메뉴 표시를 막지 않습니다.
    const photoRequest = new XMLHttpRequest();
    photoRequest.open("GET", "/api/photo" + query);
    photoRequest.timeout = 20000;
    photoRequest.onload = function () {
        if (requestNumber !== mealRequestNumber) return;
        if (photoRequest.status === 200) {
            const photo = JSON.parse(photoRequest.responseText);
            mealPhotoSource.href = photo.source || schoolPhotoBoard;
            if (!photo.image) {
                mealPhotoStatus.textContent = "선택한 날짜와 식사의 사진이 아직 게시되지 않았습니다.";
                return;
            }
            showMealPhoto(photo.image, date, mealName, requestNumber);
        } else {
            photoRequest.onerror();
        }
    };
    photoRequest.onerror = function () {
        if (requestNumber === mealRequestNumber) mealPhotoStatus.textContent = "사진 조회에 실패했습니다. 다시 시도하거나 출처 링크를 확인해주세요.";
    };
    photoRequest.ontimeout = photoRequest.onerror;
    photoRequest.send();
    return true;
}

document.getElementById("mealPicker").onclick = function () {
    document.getElementById("mealPickerLayer").hidden = false;
    mealDateInput.focus();
};
document.getElementById("closeMealDialog").onclick = closeMealPicker;
document.getElementById("mealPickerBackground").onclick = closeMealPicker;
document.getElementById("mealPickerLayer").onkeydown = function (event) {
    if (event.key === "Escape") closeMealPicker();
};
document.getElementById("mealForm").onsubmit = function () {
    if (loadMeal()) closeMealPicker();
    return false;
};
mealDateInput.onchange = loadMeal;
mealTypeInput.onchange = loadMeal;
mealDateInput.value = dateToInput(new Date());
loadMeal();
