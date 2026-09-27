import { useAuth } from "../AuthProvider";

export function PendingScreen() {
  const { signOut, refreshProfile } = useAuth();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-6 text-center dark:bg-gray-950">
      <span className="text-4xl">⏳</span>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">관리자 승인 대기 중</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        가입해 주셔서 감사합니다. 관리자가 승인하면 바로 이용하실 수 있어요.
      </p>
      <div className="mt-2 flex gap-3">
        <button
          onClick={() => refreshProfile()}
          className="h-11 rounded-xl border border-gray-300 px-5 text-sm font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-200"
        >
          새로고침
        </button>
        <button
          onClick={() => signOut()}
          className="h-11 rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white dark:bg-white dark:text-gray-900"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
