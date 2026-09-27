import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";

export function LoginScreen() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) setError(error);
    else navigate("/", { replace: true });
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center gap-6 bg-white px-6 dark:bg-gray-950">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">TOEIC Speaking AL 트레이너</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">로그인하고 학습을 이어가세요.</p>
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
          placeholder="비밀번호"
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
          {submitting ? "로그인 중…" : "로그인"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        계정이 없으신가요?{" "}
        <Link to="/signup" className="font-semibold text-blue-600">
          회원가입
        </Link>
      </p>
    </div>
  );
}
