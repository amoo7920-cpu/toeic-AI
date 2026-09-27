import { useCallback, useRef, useState } from "react";

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: unknown) => void) | null;
  onerror: ((event: unknown) => void) | null;
  start: () => void;
  stop: () => void;
}

// Phase 5: 녹음 중 Web Speech API로 실시간 전사한다. Chrome 계열에서만 동작한다.
export function useSpeechTranscript() {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [transcript, setTranscript] = useState("");
  const supported =
    typeof window !== "undefined" &&
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  const start = useCallback(() => {
    setTranscript("");
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const results = (event as { results: ArrayLike<{ 0: { transcript: string } }> }).results;
      let text = "";
      for (let i = 0; i < results.length; i++) text += results[i][0].transcript;
      setTranscript(text.trim());
    };
    recognition.onerror = () => {};
    recognition.start();
    recognitionRef.current = recognition;
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { start, stop, transcript, supported };
}
