// 손으로 작성한 임시 타입. Supabase 프로젝트 연결 후
// `npm run supabase:types` 로 이 파일을 자동 생성 결과로 교체한다.
export type AppRole = "admin" | "user";
export type UserStatus = "pending" | "active" | "blocked";
export type QStatus = "draft" | "published" | "archived";
export type QLevel = "IH" | "AL" | "AM";
export type JobStatus = "running" | "success" | "failed";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  role: AppRole;
  status: UserStatus;
  exam_date: string | null;
  target_grade: string;
  created_at: string;
}

export interface Chapter {
  id: number;
  code: string;
  name: string;
  question_nos: number[];
  prep_secs: number[];
  response_secs: number[];
}

export interface AnswerTemplate {
  id: string;
  chapter_id: number;
  label: string;
  skeleton: string;
  slot_keys: string[];
  logic: string;
  min_words: number | null;
  max_words: number | null;
}

export interface QuestionSet {
  id: string;
  chapter_id: number;
  difficulty: QLevel;
  topic_key: string;
  content_hash: string;
  stimulus: Record<string, unknown>;
  status: QStatus;
  source: "ai" | "manual";
  created_by: string | null;
  created_at: string;
  published_at: string | null;
}

export interface Question {
  id: string;
  set_id: string;
  no: number;
  prompt: string;
  prep_sec: number;
  response_sec: number;
  model_answer: Record<string, unknown>;
  key_expressions: string[];
  rater_notes: string | null;
  image_url: string | null;
  image_credit: string | null;
}

export interface GenerationJob {
  id: string;
  requested_by: string;
  chapter_id: number;
  difficulty: QLevel | null;
  auto_publish: boolean;
  status: JobStatus;
  set_id: string | null;
  error: string | null;
  created_at: string;
  finished_at: string | null;
}

export interface Attempt {
  id: string;
  user_id: string;
  question_id: string;
  mode: "chapter" | "weak" | "daily5" | "mock" | "review";
  self_score: Record<string, unknown> | null;
  total_score: number | null;
  duration_sec: number | null;
  created_at: string;
}

export interface ReviewScheduleRow {
  user_id: string;
  question_id: string;
  due_date: string;
  interval_days: number;
  ease: number;
}

export interface UserStats {
  user_id: string;
  xp: number;
  streak: number;
  best_streak: number;
  streak_freezes: number;
  last_study_date: string | null;
}

export interface UserBadge {
  user_id: string;
  badge_code: string;
  earned_at: string;
}

export interface ChapterStats {
  chapter_id: number;
  code: string;
  name: string;
  published: number;
  draft: number;
  archived: number;
  last_added_at: string | null;
}
