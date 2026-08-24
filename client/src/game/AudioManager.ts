// Frostbite Toybox audio: small WebAudio toy tones only begin after a player gesture.
export type AudioCue = "jump" | "bounce" | "score" | "knockout" | "start";

export class AudioManager {
  private context: AudioContext | null = null;
  private isMuted = false;

  async unlock() {
    if (!this.context) {
      const AudioContextCtor = window.AudioContext;
      if (!AudioContextCtor) return;
      this.context = new AudioContextCtor();
    }
    if (this.context.state === "suspended") await this.context.resume();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  get muted() {
    return this.isMuted;
  }

  play(cue: AudioCue) {
    if (!this.context || this.context.state !== "running" || this.isMuted) return;
    const now = this.context.currentTime;
    const config: Record<AudioCue, [number, number, number, OscillatorType]> = {
      jump: [370, 470, 0.11, "triangle"],
      bounce: [480, 760, 0.18, "sine"],
      score: [610, 820, 0.16, "sine"],
      knockout: [160, 90, 0.19, "triangle"],
      start: [260, 520, 0.24, "square"],
    };
    const [from, to, length, shape] = config[cue];
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = shape;
    oscillator.frequency.setValueAtTime(from, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, to), now + length);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.11, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + length + 0.02);
  }

  dispose() {
    void this.context?.close();
    this.context = null;
  }
}
