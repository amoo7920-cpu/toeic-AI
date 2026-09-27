import Dexie, { type Table } from "dexie";

// 8-5 데이터 보관: 문제 캐시(오프라인 출제용) + 학습 기록 대기열(outbox)
// app과 02-exam 등 여러 워크스페이스가 함께 쓰므로 shared/에 둔다.
export interface CachedQuestion {
  id: string;
  chapterId: number;
  no: number;
  prompt: string;
  prepSec: number;
  responseSec: number;
  modelAnswer: unknown;
  keyExpressions: string[];
  imageUrl: string | null;
  cachedAt: number;
}

export interface OutboxAttempt {
  localId: string;
  questionId: string;
  mode: string;
  selfScore: unknown;
  totalScore: number | null;
  durationSec: number | null;
  createdAt: number;
  synced: boolean;
}

export interface RecordingBlob {
  id: string;
  attemptLocalId: string;
  blob: Blob;
  createdAt: number;
}

class AppDatabase extends Dexie {
  questionCache!: Table<CachedQuestion, string>;
  attemptsOutbox!: Table<OutboxAttempt, string>;
  recordings!: Table<RecordingBlob, string>;

  constructor() {
    super("toeic-speaking-app");
    this.version(1).stores({
      questionCache: "id, chapterId",
      attemptsOutbox: "localId, synced",
      recordings: "id, attemptLocalId",
    });
  }
}

export const db = new AppDatabase();
