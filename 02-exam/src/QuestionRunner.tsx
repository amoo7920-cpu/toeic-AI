import { useEffect, useRef, useState } from "react";
import { useCountdown } from "./hooks/useCountdown";
import { useRecorder } from "./hooks/useRecorder";
import { useTTS } from "./hooks/useTTS";
import { playBeep } from "./lib/beep";
import { StimulusView } from "./components/StimulusView";
import { SelfScoreChecklist } from "./components/SelfScoreChecklist";
import { CircularTimer } from "./components/CircularTimer";
import type { ExamQuestion } from "./lib/fetchExamQuestions";

type Phase = "prep" | "response" | "review";

export interface QuestionResult {
  selfScore: Record<string, boolean>;
  totalScore: number;
  durationSec: number;
}

// 7-2 출제 화면 흐름: 준비 타이머 → 삐 소리 → 답변 타이머+자동 녹음 → 재생/모범답안/자기채점
export function QuestionRunner({
  question,
  index,
  total,
  onSubmit,
}: {
  question: ExamQuestion;
  index: number;
  total: number;
  onSubmit: (result: QuestionResult) => void;
}) {
  const [phase, setPhase] = useState<Phase>("prep");
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const { speakAsync, stop: stopTTS } = useTTS();
  const recorder = useRecorder();
  const startedAtRef = useRef<number>(Date.now());

  const needsTTS = question.chapterId === 3 || question.chapterId === 4 || question.chapterId === 5;
  // Ch4의 자료 읽기 문항(no=8)은 45초 동안 먼저 자료표를 읽고, 그 다음에 질문을 듣는다.
  // 나머지는 질문을 먼저 듣고 나서 준비 시간이 시작된다.
  const ttsAfterPrep = question.chapterId === 4 && question.no === 8;
  const ttsBeforePrep = needsTTS && !ttsAfterPrep;

  const prep = useCountdown(question.prepSec, async () => {
    if (ttsAfterPrep) await speakAsync(question.prompt);
    playBeep();
    setPhase("response");
  });
  const response = useCountdown(question.responseSec, () => {
    recorder.stop();
    setPhase("review");
  });

  useEffect(() => {
    setPhase("prep");
    setShowModelAnswer(false);
    prep.reset();
    response.reset();
    startedAtRef.current = Date.now();
    let cancelled = false;
    (async () => {
      if (ttsBeforePrep) await speakAsync(question.prompt);
      if (!cancelled) prep.start();
    })();
    return () => {
      cancelled = true;
      stopTTS();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  useEffect(() => {
    if (phase === "response") {
      recorder.start();
      response.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function handleScoreSubmit(selfScore: Record<string, boolean>, totalScore: number) {
    const durationSec = Math.round((Date.now() - startedAtRef.current) / 1000);
    onSubmit({ selfScore, totalScore, durationSec });
  }

  const showPromptText = question.chapterId !== 1 && (question.chapterId !== 2 || phase !== "prep");

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {index + 1} / {total} · Q{question.no}
      </p>

      <StimulusView question={question} />

      {showPromptText && (
        <p className="text-base font-medium text-gray-900 dark:text-white">{question.prompt}</p>
      )}

      {phase === "prep" && (
        <div className="flex flex-col items-center gap-3 py-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">준비 시간</p>
          <CircularTimer remaining={prep.remaining} total={question.prepSec} />
          <button
            onClick={() => prep.skip()}
            className="h-10 rounded-xl border border-gray-300 px-4 text-sm font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-300"
          >
            준비 시간 건너뛰기
          </button>
        </div>
      )}

      {phase === "response" && (
        <div className="flex flex-col items-center gap-3 py-6">
          <p className="text-sm font-semibold text-red-500">● 녹음 중 · 답변 시간</p>
          <CircularTimer remaining={response.remaining} total={question.responseSec} />
          <button
            onClick={() => response.skip()}
            className="h-10 rounded-xl border border-gray-300 px-4 text-sm font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-300"
          >
            답변 완료
          </button>
          {recorder.error && (
            <p className="text-center text-sm text-red-500">
              {recorder.error} (마이크 권한을 확인해주세요. 답변 시간은 계속 흘러갑니다.)
            </p>
          )}
        </div>
      )}

      {phase === "review" && (
        <div className="flex flex-col gap-4">
          {recorder.audioUrl && <audio src={recorder.audioUrl} controls className="w-full" />}

          <button
            onClick={() => setShowModelAnswer((v) => !v)}
            className="h-11 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200"
          >
            {showModelAnswer ? "모범답안 숨기기" : "모범답안 보기"}
          </button>
          {showModelAnswer && (
            <div className="rounded-2xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700 dark:bg-gray-900 dark:text-gray-300">
              {question.modelAnswer?.rendered}
            </div>
          )}

          <SelfScoreChecklist onSubmit={handleScoreSubmit} />
        </div>
      )}
    </div>
  );
}
