// 준비 시간 종료 → 삐 소리 → 답변 시간 시작(7-2). 외부 오디오 파일 없이 Web Audio로 생성한다.
export function playBeep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
    osc.onended = () => ctx.close();
  } catch {
    // 오디오 컨텍스트를 못 만드는 환경에서는 조용히 무시
  }
}
