import { useCallback } from "react";

/**
 * Returns functions to play a short correct chime and a wrong buzzer
 * using the Web Audio API (no external files needed).
 */
export function useGameSounds() {
  const playCorrect = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      // Short high-pitched ding (raised pitch)
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(1760, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        2640,
        ctx.currentTime + 0.12,
      );

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.35);
      oscillator.onended = () => ctx.close();
    } catch {
      // Silently fail if AudioContext not available
    }
  }, []);

  const playWrong = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      // Harsh buzzer: square wave descending
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(220, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        110,
        ctx.currentTime + 0.4,
      );

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.45);
      oscillator.onended = () => ctx.close();
    } catch {
      // Silently fail if AudioContext not available
    }
  }, []);

  return { playCorrect, playWrong };
}
