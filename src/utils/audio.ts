// Procedural Web Audio API sound generator for NASA Mission Control experience
// Works client-side without any external sound files or asset dependencies

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser autoplay policies
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (!val) {
      this.stopNarration();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // Quick high-tech UI chirp
  public playClick(freq = 1200) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio not supported or blocked
    }
  }

  // Radio carrier squelch / static burst
  public playRadioSquelch(duration = 0.12) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass filter to make it sound like VHF radio
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1600;
      filter.Q.value = 1.2;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {
      // Audio not supported
    }
  }

  // Sonar / deep space telemetry beacon lock
  public playBeaconLock() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch {
      // Audio not supported
    }
  }

  // Authentic NASA Apollo Quindar Tone generator (in-band PTT telemetry control)
  // Intro tone: 2500-2525 Hz, 250ms duration, un-mutes ground station transmitter
  public playQuindarIntro(): Promise<void> {
    if (!this.enabled) return Promise.resolve();

    return new Promise((resolve) => {
      try {
        const ctx = this.getContext();
        if (!ctx) {
          resolve();
          return;
        }

        this.playRadioSquelch(0.06);

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(2500, ctx.currentTime);

        // Crisp 250ms Quindar beep envelope
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + 0.22);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);

        setTimeout(() => {
          resolve();
        }, 260);
      } catch {
        resolve();
      }
    });
  }

  // Outro tone: 2525 Hz (or 2475 Hz), 250ms duration, releases transmitter carrier
  public playQuindarOutro(): Promise<void> {
    if (!this.enabled) return Promise.resolve();

    return new Promise((resolve) => {
      try {
        const ctx = this.getContext();
        if (!ctx) {
          resolve();
          return;
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(2525, ctx.currentTime);

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + 0.22);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);

        setTimeout(() => {
          this.playRadioSquelch(0.08);
          resolve();
        }, 260);
      } catch {
        resolve();
      }
    });
  }

  // Historical transmission playback chirp
  public playTransmissionChirp() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const frequencies = [660, 880, 1100];
      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        const startTime = ctx.currentTime + index * 0.06;
        gain.gain.setValueAtTime(0.04, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.05);
      });
    } catch {
      // Audio not supported
    }
  }

  // Client-side voice narrator using window.speechSynthesis wrapped in authentic NASA Quindar tones
  public narrate(
    text: string,
    onStart?: () => void,
    onEnd?: () => void
  ): () => void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return () => {};
    }

    // Stop any existing narration
    this.stopNarration();

    this.isSpeaking = true;
    let cancelled = false;

    // Trigger Quindar Intro beep first
    this.playQuindarIntro().then(() => {
      if (cancelled || !this.enabled) {
        this.isSpeaking = false;
        onEnd?.();
        return;
      }

      // Clean Markdown / brackets from speech text
      const cleanText = text
        .replace(/\[.*?\]/g, '')
        .replace(/[*_#`]/g, '')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.93;
      utterance.pitch = 0.96;

      // Select best natural voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Daniel') ||
              v.name.includes('Samantha') ||
              v.name.includes('Google UK English') ||
              v.name.includes('Google US English') ||
              v.name.includes('Natural'))
        ) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        if (!cancelled) {
          onStart?.();
        }
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (!cancelled) {
          this.playQuindarOutro().then(() => {
            onEnd?.();
          });
        } else {
          onEnd?.();
        }
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        onEnd?.();
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    });

    // Return cleanup / stop function
    return () => {
      cancelled = true;
      this.stopNarration();
    };
  }

  public stopNarration() {
    this.isSpeaking = false;
    this.currentUtterance = null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }

  public getIsNarrating(): boolean {
    return this.isSpeaking;
  }
}

export const sound = new SoundManager();
