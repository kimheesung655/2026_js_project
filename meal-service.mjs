export const SCHOOL_ORIGIN = 'https://www.e-mirim.hs.kr';
export const BOARD_URL = `${SCHOOL_ORIGIN}/schoollife/food.do`;
export const MEAL_NAMES = { '1': '조식', '2': '중식', '3': '석식' };

export function validDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const value = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(value.getTime()) && value.toISOString().slice(0, 10) === date;
}

export function findPost(html, date) {
  const title = date.slice(2).replaceAll('-', '/');
  for (const match of html.matchAll(/<a\b[^>]*onclick="goDetail\('(\d+)'\)[^>]*>([\s\S]*?)<\/a>/gi)) {
    if (match[2].replace(/<[^>]*>/g, '').trim().startsWith(title)) return match[1];
  }
  return null;
}

export function findPhoto(html, date, mealType) {
  const title = html.match(/<p\b[^>]*class="tit"[^>]*>([\s\S]*?)<\/p>/i)?.[1];
  if (!title?.trim().startsWith(date.slice(2).replaceAll('-', '/'))) return null;
  const content = html.match(/<div class="view-txt">([\s\S]*?)<\/div>/i)?.[1] || '';
  let currentMeal = null;
  for (const match of content.matchAll(/&lt;(조식|중식|석식)&gt;|<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    if (match[1]) currentMeal = match[1];
    else if (currentMeal === MEAL_NAMES[mealType]) {
      const url = new URL(match[2].replaceAll('&amp;', '&'), SCHOOL_ORIGIN);
      if (url.origin === SCHOOL_ORIGIN && url.pathname.startsWith('/upload/')) return url.href;
    }
  }
  return null;
}

export function readMeal(payload) {
  const result = payload.RESULT || payload.mealServiceDietInfo?.[0]?.head?.find(item => item.RESULT)?.RESULT;
  if (result?.CODE === 'INFO-200') return null;
  if (result?.CODE !== 'INFO-000') throw new Error('급식 API가 정상 응답하지 않았습니다.');
  return payload.mealServiceDietInfo?.[1]?.row?.[0] || null;
}

export async function upstream(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`외부 사이트 응답 오류: ${response.status}`);
  return response;
}

export async function getMeal(date, mealType) {
  const url = new URL('https://open.neis.go.kr/hub/mealServiceDietInfo');
  url.search = new URLSearchParams({ Type: 'json', pIndex: '1', pSize: '5',
    ATPT_OFCDC_SC_CODE: 'B10', SD_SCHUL_CODE: '7011569',
    MLSV_YMD: date.replaceAll('-', ''), MMEAL_SC_CODE: mealType });
  if (process.env.NEIS_API_KEY) url.searchParams.set('KEY', process.env.NEIS_API_KEY);
  const row = readMeal(await (await upstream(url)).json());
  return row ? { menu: row.DDISH_NM, calories: row.CAL_INFO,
    nutrition: row.NTR_INFO, origin: row.ORPLC_INFO } : null;
}

export async function getPhoto(date, mealType) {
  const list = new URL(BOARD_URL);
  list.search = new URLSearchParams({ sch_cd: 'title', sch_nm: date.slice(2).replaceAll('-', '/'), curPage: '1' });
  const id = findPost(await (await upstream(list)).text(), date);
  if (!id) return { image: null, source: BOARD_URL };
  const source = `${SCHOOL_ORIGIN}/schoollife/foodDetail.do?idx=${id}`;
  return { image: findPhoto(await (await upstream(source)).text(), date, mealType), source };
}
