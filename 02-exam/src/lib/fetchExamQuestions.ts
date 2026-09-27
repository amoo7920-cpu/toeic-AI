import type { SupabaseClient } from "@supabase/supabase-js";

export type ExamMode = "chapter" | "weak" | "daily5" | "mock" | "review";

export interface ExamQuestion {
  id: string;
  no: number;
  prompt: string;
  prepSec: number;
  responseSec: number;
  modelAnswer: { templateId: string; slots: Record<string, string>; rendered: string; wordCount: number };
  keyExpressions: string[];
  raterNotes: string | null;
  imageUrl: string | null;
  chapterId: number;
  stimulus: { text: string | null; infoTable: unknown; scenario: string | null };
}

const CHAPTER_QUESTION_COUNT: Record<number, number> = { 1: 2, 2: 2, 3: 3, 4: 3, 5: 1 };

interface RawQuestionRow {
  id: string;
  no: number;
  prompt: string;
  prep_sec: number;
  response_sec: number;
  model_answer: ExamQuestion["modelAnswer"];
  key_expressions: string[] | null;
  rater_notes: string | null;
  image_url: string | null;
  question_sets: { chapter_id: number; stimulus: ExamQuestion["stimulus"] } | null;
}

// 7-3 출제 알고리즘: get_next_questions RPC로 문항 id를 고른 뒤, 화면에 필요한
// 세트 정보(챕터, 자료표/사진 등)를 붙여서 돌려준다.
async function enrichAndOrder(supabase: SupabaseClient, ids: string[]): Promise<ExamQuestion[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, no, prompt, prep_sec, response_sec, model_answer, key_expressions, rater_notes, image_url, question_sets!inner(chapter_id, stimulus)"
    )
    .in("id", ids);
  if (error || !data) return [];

  const byId = new Map((data as unknown as RawQuestionRow[]).map((row) => [row.id, row]));
  return ids
    .map((id) => byId.get(id))
    .filter((row): row is RawQuestionRow => Boolean(row && row.question_sets))
    .map((row) => ({
      id: row.id,
      no: row.no,
      prompt: row.prompt,
      prepSec: row.prep_sec,
      responseSec: row.response_sec,
      modelAnswer: row.model_answer,
      keyExpressions: row.key_expressions ?? [],
      raterNotes: row.rater_notes,
      imageUrl: row.image_url,
      chapterId: row.question_sets!.chapter_id,
      stimulus: row.question_sets!.stimulus ?? { text: null, infoTable: null, scenario: null },
    }));
}

export async function fetchExamQuestions(
  supabase: SupabaseClient,
  mode: ExamMode,
  chapterId?: number
): Promise<ExamQuestion[]> {
  if (mode === "daily5") {
    const ids: string[] = [];
    for (let ch = 1; ch <= 5; ch++) {
      const { data } = await supabase.rpc("get_next_questions", {
        p_mode: "chapter",
        p_chapter: ch,
        p_limit: CHAPTER_QUESTION_COUNT[ch] ?? 3,
      });
      for (const q of data ?? []) ids.push((q as { id: string }).id);
    }
    return enrichAndOrder(supabase, ids);
  }

  if (mode === "mock") {
    const { data } = await supabase.rpc("get_next_questions", {
      p_mode: "mock",
      p_chapter: null,
      p_limit: 11,
    });
    return enrichAndOrder(supabase, (data ?? []).map((q: { id: string }) => q.id));
  }

  const { data } = await supabase.rpc("get_next_questions", {
    p_mode: mode,
    p_chapter: mode === "chapter" ? chapterId ?? null : null,
    p_limit: mode === "review" ? 20 : 10,
  });
  return enrichAndOrder(supabase, (data ?? []).map((q: { id: string }) => q.id));
}
