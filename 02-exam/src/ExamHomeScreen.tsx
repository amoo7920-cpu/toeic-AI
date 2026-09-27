// Phase 2에서 구현: 챕터 연습/유형 집중/데일리 5/실전 모의고사/복습 모드 선택 화면
export function ExamHomeScreen() {
  const modes = [
    { key: "chapter", label: "챕터 연습", desc: "챕터 1개를 골라 연속으로 풀어요" },
    { key: "weak", label: "유형 집중", desc: "최근 점수가 낮은 챕터 자동 선택 · 10분" },
    { key: "daily5", label: "데일리 5", desc: "챕터별 1세트씩 · 약 8분" },
    { key: "mock", label: "실전 모의고사", desc: "Q1~Q11 실제 순서 그대로 · 약 20분" },
    { key: "review", label: "복습", desc: "오늘 복습할 문제만" },
  ];

  return (
    <div className="flex flex-col gap-3 px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">출제</h1>
      {modes.map((m) => (
        <button
          key={m.key}
          className="flex flex-col items-start rounded-2xl border border-gray-200 p-4 text-left active:bg-gray-50 dark:border-gray-800 dark:active:bg-gray-900"
        >
          <span className="font-semibold text-gray-900 dark:text-white">{m.label}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{m.desc}</span>
        </button>
      ))}
    </div>
  );
}
