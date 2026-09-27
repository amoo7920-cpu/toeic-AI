// Ch2(사진 묘사)용 사진 검색. 사람 2명 이상이 등장하는 장면 키워드 풀에서 랜덤으로 고른다.
const SCENE_KEYWORDS = [
  "office meeting",
  "team collaboration",
  "coworkers discussion",
  "restaurant customers",
  "construction workers",
  "classroom students",
  "street market vendors",
  "family kitchen",
  "warehouse workers",
  "park people walking",
];

export interface PexelsPhoto {
  url: string;
  credit: string;
}

export async function searchPexelsPhoto(apiKey: string): Promise<PexelsPhoto> {
  const keyword = SCENE_KEYWORDS[Math.floor(Math.random() * SCENE_KEYWORDS.length)];
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(keyword)}&per_page=15&orientation=landscape`,
    { headers: { Authorization: apiKey } }
  );
  if (!res.ok) throw new Error(`Pexels API error ${res.status}: ${await res.text()}`);

  const json = await res.json();
  const photos = json.photos as { src: { large: string }; photographer: string }[] | undefined;
  if (!photos || photos.length === 0) throw new Error(`No Pexels results for "${keyword}"`);

  const photo = photos[Math.floor(Math.random() * photos.length)];
  return { url: photo.src.large, credit: `Photo by ${photo.photographer} on Pexels` };
}
