import { SoundKitItem } from "./types";

export type PadKey = "kick" | "snare" | "hat" | "tom" | "clap" | "crash";

export interface PadDefinition {
  key: string;
  name: string;
  id: PadKey;
}

export const DRUM_PADS: PadDefinition[] = [
  { key: "Q", name: "Kick", id: "kick" },
  { key: "W", name: "Snare", id: "snare" },
  { key: "E", name: "Hi-hat", id: "hat" },
  { key: "A", name: "Tom", id: "tom" },
  { key: "S", name: "Clap", id: "clap" },
  { key: "D", name: "Crash", id: "crash" },
];

export const BEAT_PATTERN: Record<string, number[]> = {
  kick: [0, 4, 8, 10],
  snare: [4, 12],
  hat: [0, 2, 4, 6, 8, 10, 12, 14],
  clap: [12],
  crash: [0],
};

class DrumAudioEngine {
  private ctx: AudioContext | null = null;
  private masterFilter: BiquadFilterNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private audioElements: Record<string, HTMLAudioElement> = {};

  private initContext() {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();

      this.masterFilter = this.ctx.createBiquadFilter();
      this.masterFilter.type = "lowpass";
      this.masterFilter.frequency.value = 18000;

      const gain = this.ctx.createGain();
      gain.gain.value = 0.85;

      this.masterFilter.connect(gain);
      gain.connect(this.ctx.destination);

      // Create white noise buffer
      this.noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    return this.ctx;
  }

  private envelope(gainNode: GainNode, time: number, attack: number, duration: number, peak: number) {
    gainNode.gain.setValueAtTime(0.0001, time);
    gainNode.gain.exponentialRampToValueAtTime(peak, time + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  }

  private playOscillator(type: OscillatorType, f0: number, f1: number, time: number, duration: number, peak: number) {
    if (!this.ctx || !this.masterFilter) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, time);
    osc.frequency.exponentialRampToValueAtTime(f1, time + duration * 0.6);
    this.envelope(gain, time, 0.004, duration, peak);
    osc.connect(gain);
    gain.connect(this.masterFilter);
    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  private playNoise(filterType: BiquadFilterType, freq: number, time: number, duration: number, peak: number, q?: number) {
    if (!this.ctx || !this.masterFilter || !this.noiseBuffer) return;
    const source = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    source.buffer = this.noiseBuffer;
    filter.type = filterType;
    filter.frequency.value = freq;
    if (q) filter.Q.value = q;
    this.envelope(gain, time, 0.003, duration, peak);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterFilter);
    source.start(time, Math.random());
    source.stop(time + duration + 0.05);
  }

  public setLowpassFilter(frequency: number) {
    this.initContext();
    if (this.masterFilter) {
      this.masterFilter.frequency.value = frequency;
    }
  }

  public playSound(name: PadKey, kit: SoundKitItem, time?: number) {
    // If a custom sample URL was uploaded for this kit and pad, play the audio file
    const customSampleUrl = kit.samples?.[name];
    if (customSampleUrl) {
      try {
        let audio = this.audioElements[customSampleUrl];
        if (!audio) {
          audio = new Audio(customSampleUrl);
          this.audioElements[customSampleUrl] = audio;
        }
        audio.currentTime = 0;
        audio.play().catch(() => {
          // Fallback to synth if custom audio fails
          this.playSynthesized(name, kit, time);
        });
        return;
      } catch {
        // Fallback to synth
      }
    }

    this.playSynthesized(name, kit, time);
  }

  public playSynthesized(name: PadKey, kit: SoundKitItem, time?: number) {
    const ctx = this.initContext();
    if (!ctx) return;

    const t = time ?? ctx.currentTime;
    const sc = kit.synthConfig;

    switch (name) {
      case "kick":
        this.playOscillator("sine", sc.kick[0], sc.kick[1], t, sc.kick[2], 1);
        break;
      case "snare":
        this.playOscillator("triangle", sc.snare[0], sc.snare[0] * 0.6, t, sc.snare[1], 0.5);
        this.playNoise("highpass", 1800, t, sc.snare[1], 0.7);
        break;
      case "hat":
        this.playNoise("highpass", 7000, t, sc.hat[0], 0.35);
        break;
      case "tom":
        this.playOscillator("sine", 220 * sc.tom, 110 * sc.tom, t, 0.4, 0.8);
        break;
      case "clap":
        [0, 0.012, 0.024].forEach((offset) => {
          this.playNoise("bandpass", 1500, t + offset, 0.05, 0.5, 1.2);
        });
        this.playNoise("bandpass", 1500, t + 0.036, 0.2, 0.5, 1.2);
        break;
      case "crash":
        this.playNoise("highpass", 5000, t, sc.crash, 0.35);
        break;
    }
  }

  public playHeroSnare() {
    const defaultKit: SoundKitItem = {
      id: "hero",
      name: "Hero",
      desc: "",
      price: 0,
      sampleCount: "",
      format: "",
      synthConfig: {
        kick: [150, 45, 0.45],
        snare: [190, 0.22],
        hat: [0.05, 0.35],
        tom: 1,
        crash: 1.6,
        lp: 18000,
        bpm: 100,
      },
      order: 0,
    };
    this.playSound("snare", defaultKit);
  }
}

export const drumAudioEngine = new DrumAudioEngine();
