import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthProvider";

export function SignupScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error } = await signUp(email, password);
    setSubmitting(false);
    if (error) setError(error);
    else setDone(true);
  }

  if (done) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-white px-6 text-center dark:bg-gray-950">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">가입 완료</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          이메일 인증 후 로그인하시면, 관리자 승인 대기 화면이 표시됩니다.
        </p>
        <Link to="/login" className="mt-2 font-semibold text-blue-600">
          로그인 화면으로
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center gap-6 bg-white px-6 dark:bg-gray-950">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">회원가입</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          가입 후 관리자 승인이 필요합니다.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-xl border border-gray-300 px-4 text-base dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
        <input
          type="password"
          required
          placeholder="비밀번호 (8자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 rounded-xl border border-gray-300 px-4 text-base dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="h-12 rounded-xl bg-blue-600 text-base font-semibold text-white disabled:opacity-50"
        >
          {submitting ? "가입 중…" : "가입하기"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        이미 계정이 있으신가요?{" "}
        <Link to="/login" className="font-semibold text-blue-600">
          로그인
        </Link>
      </p>
    </div>
  );
}
