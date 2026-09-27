// Ch2(사진 묘사)용 사진 검색. 실제 최근 TOEIC Speaking에 자주 나오는 장면 유형(사무실,
// 식당/카페, 상점, 공사/작업 현장, 야외 공공장소, 교통, 가정 등)에 맞춰 구체적인 키워드로
// 검색해 실사·사람 2명 이상 등장 사진을 우선적으로 고른다.
const SCENE_KEYWORDS = [
  "business people meeting conference room",
  "coworkers collaborating office computer",
  "waiter serving customers restaurant",
  "baristas coffee shop customers counter",
  "cashier customer grocery store checkout",
  "construction workers hard hats site",
  "warehouse workers checking boxes inventory",
  "teacher students classroom lecture",
  "doctor nurse patient hospital consultation",
  "commuters walking train station platform",
  "airport passengers waiting gate",
  "farmers market vendor customers outdoor",
  "people exercising park outdoor morning",
  "family cooking kitchen together",
  "mechanic repairing car garage",
  "librarian people reading library",
  "hotel receptionist guest check-in desk",
  "street food vendor cart city",
  "people shopping clothing store retail",
  "office employees presentation whiteboard",
];

export interface PexelsPhoto {
  url: string;
  credit: string;
}

export async function searchPexelsPhoto(apiKey: string): Promise<PexelsPhoto> {
  const keyword = SCENE_KEYWORDS[Math.floor(Math.random() * SCENE_KEYWORDS.length)];
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=15&orientation=landscape&size=large`,
    { headers: { Authorization: apiKey } }
  );
  if (!res.ok) throw new Error(`Pexels API error ${res.status}: ${await res.text()}`);

  const json = await res.json();
  const photos = json.photos as { src: { large: string }; photographer: string }[] | undefined;
  if (!photos || photos.length === 0) throw new Error(`No Pexels results for "${keyword}"`);

  // Pexels는 관련도순으로 정렬해 주므로, 상위 결과 중에서 골라 주제와 더 잘 맞는 사진을 쓴다.
  const topPool = photos.slice(0, Math.min(8, photos.length));
  const photo = topPool[Math.floor(Math.random() * topPool.length)];
  return { url: photo.src.large, credit: `Photo by ${photo.photographer} on Pexels` };
}
