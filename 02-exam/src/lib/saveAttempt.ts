import type { SupabaseClient } from "@supabase/supabase-js";
import { db } from "@toeic/shared/db";

export interface AttemptInput {
  userId: string;
  questionId: string;
  mode: string;
  selfScore: Record<string, boolean>;
  totalScore: number;
  durationSec: number;
}

// 온라인이면 바로 저장, 실패하면(오프라인 등) 8-5의 outbox 대기열에 쌓아둔다.
export async function saveAttempt(supabase: SupabaseClient, input: AttemptInput): Promise<void> {
  const { error } = await supabase.from("attempts").insert({
    user_id: input.userId,
    question_id: input.questionId,
    mode: input.mode,
    self_score: input.selfScore,
    total_score: input.totalScore,
    duration_sec: input.durationSec,
  });
  if (error) {
    await db.attemptsOutbox.add({
      localId: crypto.randomUUID(),
      questionId: input.questionId,
      mode: input.mode,
      selfScore: input.selfScore,
      totalScore: input.totalScore,
      durationSec: input.durationSec,
      createdAt: Date.now(),
      synced: false,
    });
  }
}

// 온라인 복귀 시 대기열에 쌓인 기록을 서버로 올린다.
export async function flushOutbox(supabase: SupabaseClient, userId: string): Promise<void> {
  const all = await db.attemptsOutbox.toArray();
  const pending = all.filter((r) => !r.synced);
  for (const item of pending) {
    const { error } = await supabase.from("attempts").insert({
      user_id: userId,
      question_id: item.questionId,
      mode: item.mode,
      self_score: item.selfScore,
      total_score: item.totalScore,
      duration_sec: item.durationSec,
    });
    if (!error) {
      await db.attemptsOutbox.update(item.localId, { synced: true });
    }
  }
}
