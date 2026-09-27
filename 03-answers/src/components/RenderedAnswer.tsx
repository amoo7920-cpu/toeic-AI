import { useState } from "react";
import { highlightSlots } from "../lib/highlightSlots";

// 6-4 슬롯 하이라이트 + 템플릿 빈칸 퀴즈: 뼈대(회색)는 퀴즈 모드일 때 가려지고
// 클릭하면 그 부분만 드러난다. 슬롯(파란색)은 항상 보인다.
export function RenderedAnswer({
  rendered,
  slots,
  quizMode,
}: {
  rendered: string;
  slots: Record<string, string>;
  quizMode: boolean;
}) {
  const segments = highlightSlots(rendered, slots);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  return (
    <p className="text-base leading-relaxed">
      {segments.map((seg, i) => {
        if (seg.isSlot) {
          return (
            <span key={i} className="font-semibold text-blue-600 dark:text-blue-400">
              {seg.text}
            </span>
          );
        }
        if (quizMode && seg.text.trim().length > 0) {
          const isRevealed = revealed[i];
          return (
            <span
              key={i}
              onClick={() => setRevealed((r) => ({ ...r, [i]: true }))}
              className={
                isRevealed
                  ? "cursor-default text-gray-500 dark:text-gray-400"
                  : "cursor-pointer rounded bg-gray-300 text-gray-300 dark:bg-gray-700 dark:text-gray-700"
              }
            >
              {seg.text}
            </span>
          );
        }
        return (
          <span key={i} className="text-gray-500 dark:text-gray-400">
            {seg.text}
          </span>
        );
      })}
    </p>
  );
}
