import { useCallback, useEffect, useRef, useState } from "react";

// 준비/답변 원형 카운트다운 타이머. onComplete는 async여도 되고(예: TTS 재생 후 처리),
// 그 내부에서 상태를 바꾸면 카운트다운이 끝난 뒤에 맞춰 반영된다.
export function useCountdown(seconds: number, onComplete?: () => void | Promise<void>) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      onCompleteRef.current?.();
      return;
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer);
  }, [running, remaining]);

  const start = useCallback(() => setRunning(true), []);
  const reset = useCallback(() => {
    setRemaining(seconds);
    setRunning(false);
  }, [seconds]);

  return { remaining, running, start, reset };
}
