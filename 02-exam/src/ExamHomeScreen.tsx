import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CHAPTERS } from "@toeic/shared/parts";
import { ExamSession } from "./ExamSession";
import type { ExamMode } from "./lib/fetchExamQuestions";

const VALID_MODES: ExamMode[] = ["chapter", "weak", "daily5", "mock", "review"];

const MODES: { key: ExamMode; label: string; desc: string }[] = [
  { key: "chapter", label: "챕터 연습", desc: "챕터 1개를 골라 연속으로 풀어요" },
  { key: "weak", label: "유형 집중", desc: "최근 점수가 낮은 챕터 자동 선택 · 10분" },
  { key: "daily5", label: "데일리 5", desc: "챕터별 1세트씩 · 약 8분" },
  { key: "mock", label: "실전 모의고사", desc: "Q1~Q11 실제 순서 그대로 · 약 20분" },
  { key: "review", label: "복습", desc: "오늘 복습할 문제만" },
];

export function ExamHomeScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryMode = searchParams.get("mode");
  const initialMode =
    queryMode && VALID_MODES.includes(queryMode as ExamMode) ? (queryMode as ExamMode) : null;

  const [selected, setSelected] = useState<{ mode: ExamMode; chapterId?: number } | null>(
    initialMode ? { mode: initialMode } : null
  );
  const [pickingChapter, setPickingChapter] = useState(false);

  if (selected) {
    return (
      <ExamSession
        mode={selected.mode}
        chapterId={selected.chapterId}
        onExit={() => {
          setSelected(null);
          setPickingChapter(false);
          setSearchParams({}, { replace: true });
        }}
      />
    );
  }

  if (pickingChapter) {
    return (
      <div className="flex flex-col gap-3 px-4 py-6">
        <button
          onClick={() => setPickingChapter(false)}
          className="self-start text-sm text-gray-500 dark:text-gray-400"
        >
          ‹ 뒤로
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">챕터 선택</h1>
        {CHAPTERS.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected({ mode: "chapter", chapterId: c.id })}
            className="flex items-center justify-between rounded-2xl border border-gray-200 p-4 text-left active:bg-gray-50 dark:border-gray-800 dark:active:bg-gray-900"
          >
            <span className="font-semibold text-gray-900 dark:text-white">
              Ch{c.id}. {c.name}
            </span>
            <span className="text-gray-400">›</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">출제</h1>
      {MODES.map((m) => (
        <button
          key={m.key}
          onClick={() => (m.key === "chapter" ? setPickingChapter(true) : setSelected({ mode: m.key }))}
          className="flex flex-col items-start rounded-2xl border border-gray-200 p-4 text-left active:bg-gray-50 dark:border-gray-800 dark:active:bg-gray-900"
        >
          <span className="font-semibold text-gray-900 dark:text-white">{m.label}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{m.desc}</span>
        </button>
      ))}
    </div>
  );
}
