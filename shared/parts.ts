// 시험 구조 마스터 데이터 (CLAUDE.md 2장) — DB의 chapters 테이블과 1:1 대응
export type ChapterId = 1 | 2 | 3 | 4 | 5;

export interface ChapterDef {
  id: ChapterId;
  code: string;
  name: string;
  questionNos: number[];
  prepSecs: number[];
  responseSecs: number[];
  templateIds: string[];
}

export const CHAPTERS: ChapterDef[] = [
  {
    id: 1,
    code: "CH1",
    name: "Read a text aloud",
    questionNos: [1, 2],
    prepSecs: [45, 45],
    responseSecs: [45, 45],
    templateIds: ["T1-READ"],
  },
  {
    id: 2,
    code: "CH2",
    name: "Describe a picture",
    questionNos: [3, 4],
    prepSecs: [45, 45],
    responseSecs: [30, 30],
    templateIds: ["T2-PICTURE"],
  },
  {
    id: 3,
    code: "CH3",
    name: "Respond to questions",
    questionNos: [5, 6, 7],
    prepSecs: [3, 3, 3],
    responseSecs: [15, 15, 30],
    templateIds: ["T3-SHORT", "T3-LONG"],
  },
  {
    id: 4,
    code: "CH4",
    name: "Respond using information provided",
    questionNos: [8, 9, 10],
    prepSecs: [45, 3, 3],
    responseSecs: [15, 15, 30],
    templateIds: ["T4-Q8", "T4-Q9", "T4-Q10"],
  },
  {
    id: 5,
    code: "CH5",
    name: "Express an opinion",
    questionNos: [11],
    prepSecs: [45],
    responseSecs: [60],
    templateIds: ["T5-OPINION"],
  },
];

export function getChapter(id: ChapterId): ChapterDef {
  const chapter = CHAPTERS.find((c) => c.id === id);
  if (!chapter) throw new Error(`Unknown chapter id: ${id}`);
  return chapter;
}

// 등급 환산 (8-1 레벨업 시스템에서 재사용)
export const GRADE_XP_THRESHOLDS = [
  { grade: "IM2", xp: 0, title: "수습 응시자" },
  { grade: "IM3", xp: 500, title: "주니어 스피커" },
  { grade: "IH", xp: 1500, title: "시니어 스피커" },
  { grade: "AL", xp: 3500, title: "목표 달성 — 어드밴스드" },
  { grade: "AM", xp: 6000, title: "마스터" },
  { grade: "AH", xp: 10000, title: "레전드" },
] as const;

export const WORD_COUNT_RANGES: Record<string, { min: number; max: number }> = {
  "T2-PICTURE": { min: 50, max: 70 },
  "T3-LONG": { min: 55, max: 75 },
  "T4-Q10": { min: 50, max: 70 },
  "T5-OPINION": { min: 110, max: 140 },
};
