import { useCallback } from "react";

// Ch3~5는 질문을 TTS로 들려주고 화면에도 텍스트를 함께 보여준다(7-2).
export function useTTS() {
  const speakAsync = useCallback((text: string, rate = 1.0): Promise<void> => {
    return new Promise((resolve) => {
      if (!("speechSynthesis" in window)) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.rate = rate;
      utter.onend = () => resolve();
      utter.onerror = () => resolve();
      window.speechSynthesis.speak(utter);
    });
  }, []);

  const stop = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  return { speakAsync, stop };
}
