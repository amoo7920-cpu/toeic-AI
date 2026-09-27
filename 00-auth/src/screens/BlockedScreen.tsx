import { useAuth } from "../AuthProvider";

export function BlockedScreen() {
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-6 text-center dark:bg-gray-950">
      <span className="text-4xl">🚫</span>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">이용이 제한되었습니다</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        문의사항이 있으면 관리자에게 연락해 주세요.
      </p>
      <button
        onClick={() => signOut()}
        className="mt-2 h-11 rounded-xl bg-gray-900 px-5 text-sm font-semibold text-white dark:bg-white dark:text-gray-900"
      >
        로그아웃
      </button>
    </div>
  );
}
