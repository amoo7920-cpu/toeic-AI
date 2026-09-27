import { useState } from "react";

// 7-4 자기채점 체크리스트
const ITEMS = [
  { key: "filledTime", label: "답변 시간의 80% 이상 채웠는가" },
  { key: "templateStructure", label: "템플릿 구조(도입 → 근거 → 마무리)를 지켰는가" },
  { key: "noLongPause", label: "3초 이상 멈춘 적이 없는가" },
  { key: "grammarChecked", label: "시제·수일치 실수를 알아챘는가" },
  { key: "contentRelevant", label: "질문에 정확히 답했는가 / 예시가 구체적인가" },
] as const;

export function SelfScoreChecklist({
  onSubmit,
}: {
  onSubmit: (selfScore: Record<string, boolean>, totalScore: number) => void;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  function toggle(key: string) {
    setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSubmit() {
    const count = ITEMS.filter((i) => checked[i.key]).length;
    onSubmit(checked, Math.max(1, count));
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">자기채점</p>
      {ITEMS.map((item) => (
        <label
          key={item.key}
          className="flex items-start gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-800"
        >
          <input
            type="checkbox"
            checked={!!checked[item.key]}
            onChange={() => toggle(item.key)}
            className="mt-0.5 h-5 w-5 shrink-0"
          />
          <span className="text-sm text-gray-800 dark:text-gray-200">{item.label}</span>
        </label>
      ))}
      <button
        onClick={handleSubmit}
        className="h-12 rounded-xl bg-blue-600 text-base font-semibold text-white"
      >
        채점 완료 · 다음 문제
      </button>
    </div>
  );
}
