import type { ExamQuestion } from "../lib/fetchExamQuestions";

interface InfoTableItem {
  time: string;
  person: string;
  activity: string;
}
interface InfoTable {
  title: string;
  date: string;
  location: string;
  items: InfoTableItem[];
}

// 챕터별로 준비 시간에 보여줄 자료(지문/사진/일정표/시나리오)를 렌더링한다(7-2).
export function StimulusView({ question }: { question: ExamQuestion }) {
  if (question.chapterId === 1) {
    return (
      <div className="rounded-2xl border border-gray-200 p-4 text-lg leading-relaxed text-gray-900 dark:border-gray-800 dark:text-white">
        {question.prompt}
      </div>
    );
  }

  if (question.chapterId === 2 && question.imageUrl) {
    return (
      <img
        src={question.imageUrl}
        alt="describe this scene"
        className="w-full rounded-2xl object-cover"
      />
    );
  }

  if (question.chapterId === 4 && question.stimulus?.infoTable) {
    const table = question.stimulus.infoTable as InfoTable;
    return (
      <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
        <p className="font-bold text-gray-900 dark:text-white">{table.title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {table.date} · {table.location}
        </p>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-gray-800 dark:text-gray-200">
          {(table.items ?? []).map((item, i) => (
            <li key={i} className="border-t border-gray-100 pt-2 dark:border-gray-800">
              <span className="font-semibold">{item.time}</span> — {item.person}: {item.activity}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (question.stimulus?.scenario) {
    return (
      <p className="rounded-2xl bg-gray-50 p-4 text-base text-gray-700 dark:bg-gray-900 dark:text-gray-300">
        {question.stimulus.scenario}
      </p>
    );
  }

  return null;
}
