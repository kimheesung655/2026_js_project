function calculateRankings(rows) {
    const rankings = [];
    for (const row of rows) {
        let menu = rankings.find(item => item.menuName === row.menu_name);
        if (!menu) {
            menu = { menuName: row.menu_name, total: 0, count: 0, average: 0 };
            rankings.push(menu);
        }
        menu.total += Number(row.rating);
        menu.count += 1;
    }
    for (const menu of rankings) menu.average = menu.total / menu.count;
    rankings.sort(function (a, b) {
        if (b.average !== a.average) return b.average - a.average;
        if (b.count !== a.count) return b.count - a.count;
        if (a.menuName < b.menuName) return -1;
        if (a.menuName > b.menuName) return 1;
        return 0;
    });
    return rankings.slice(0, 5);
}

function showRankings(rankings) {
    const status = document.getElementById("rankStatus");
    if (!rankings.length) {
        status.textContent = "아직 등록된 리뷰가 없습니다.";
        return;
    }
    status.hidden = true;
    for (let index = 0; index < 5; index += 1) {
        const item = document.getElementById("rankItem" + index);
        const menu = rankings[index];
        if (!menu) {
            item.hidden = true;
        } else {
            item.hidden = false;
            document.getElementById("rankName" + index).textContent = menu.menuName;
            document.getElementById("rankMeta" + index).textContent = "평균 별점 : " + menu.average.toFixed(1) + " / 5.0 · 리뷰 " + menu.count + "개";
            document.getElementById("rankScore" + index).textContent = menu.average.toFixed(1);
        }
    }
}

supabaseRequest("/rest/v1/reviews?select=menu_name,rating", "GET", null, false, function (error, rows) {
    if (error) {
        document.getElementById("rankStatus").textContent = "순위를 불러오지 못했습니다: " + error;
        return;
    }
    showRankings(calculateRankings(rows || []));
});
