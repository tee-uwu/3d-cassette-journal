// Audio Engine for TAPE: Real HTML5 Audio playback + Web Audio ambient synthesis for instant demos

class AudioEngine {
  private audio: HTMLAudioElement;
  private currentUrl: string | null = null;
  private onTimeUpdateCallback: ((time: number, duration: number) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private onPlayCallback: (() => void) | null = null;
  private onPauseCallback: (() => void) | null = null;

  // Web Audio synth for built-in procedural demo tracks
  private audioCtx: AudioContext | null = null;
  private synthGain: GainNode | null = null;
  private isSynthesizing = false;
  private synthTimer: any = null;
  private synthStartTime = 0;
  private synthTrackDuration = 180; // 3 min synthetic duration

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.volume = 0.8;

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.onTimeUpdateCallback && this.audio.duration && !isNaN(this.audio.duration)) {
        this.onTimeUpdateCallback(this.audio.currentTime, this.audio.duration);
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.audio.currentTime, this.audio.duration || 0);
      }
    });

    this.audio.addEventListener('ended', () => {
      if (this.onEndCallback) this.onEndCallback();
    });

    this.audio.addEventListener('play', () => {
      if (this.onPlayCallback) this.onPlayCallback();
    });

    this.audio.addEventListener('pause', () => {
      if (this.onPauseCallback) this.onPauseCallback();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio playback error on URL:', this.audio.src, e);
    });
  }

  public setCallbacks(callbacks: {
    onTimeUpdate?: (time: number, duration: number) => void;
    onEnd?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
  }) {
    if (callbacks.onTimeUpdate) this.onTimeUpdateCallback = callbacks.onTimeUpdate;
    if (callbacks.onEnd) this.onEndCallback = callbacks.onEnd;
    if (callbacks.onPlay) this.onPlayCallback = callbacks.onPlay;
    if (callbacks.onPause) this.onPauseCallback = callbacks.onPause;
  }

  public loadTrack(url: string, duration?: number) {
    if (this.currentUrl === url) return;

    this.stopSynth();
    try {
      this.audio.pause();
    } catch {}

    this.currentUrl = url;

    if (url.startsWith('synth://')) {
      // Internal procedural generative acoustic/lofi ambient tape track
      this.synthTrackDuration = duration || 180;
      return;
    }

    this.audio.src = url;
    this.audio.load();
  }

  public async play(url?: string, duration?: number) {
    if (url && url !== this.currentUrl) {
      this.loadTrack(url, duration);
    }

    if (this.currentUrl?.startsWith('synth://')) {
      this.playSynthTrack(this.currentUrl);
      return;
    }

    try {
      await this.audio.play();
    } catch (e) {
      console.warn('Playback interrupted or autoplay blocked:', e);
    }
  }

  public pause() {
    if (this.isSynthesizing) {
      this.pauseSynth();
      return;
    }
    this.audio.pause();
  }

  public seek(seconds: number) {
    if (this.isSynthesizing) {
      this.synthStartTime = Date.now() - seconds * 1000;
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(seconds, this.synthTrackDuration);
      }
      return;
    }
    try {
      const dur = this.audio.duration;
      if (dur && !isNaN(dur) && isFinite(dur)) {
        this.audio.currentTime = Math.min(Math.max(0, seconds), dur);
      } else {
        this.audio.currentTime = Math.max(0, seconds);
      }
    } catch (e) {
      console.warn('Audio seek error:', e);
    }
  }

  public setVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.audio.volume = clamped;
    if (this.synthGain && this.audioCtx) {
      this.synthGain.gain.setValueAtTime(clamped * 0.4, this.audioCtx.currentTime);
    }
  }

  public getCurrentTime(): number {
    if (this.isSynthesizing) {
      const elapsed = (Date.now() - this.synthStartTime) / 1000;
      return Math.min(elapsed, this.synthTrackDuration);
    }
    return this.audio.currentTime;
  }

  public getDuration(): number {
    if (this.isSynthesizing) {
      return this.synthTrackDuration;
    }
    return this.audio.duration || 0;
  }

  // --- Procedural Ambient / Lofi Warm Analog Synth for Instant Demo Tracks ---
  private initAudioCtx() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      this.synthGain = this.audioCtx.createGain();
      this.synthGain.gain.value = 0.25;
      this.synthGain.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private playSynthTrack(trackUri: string) {
    this.initAudioCtx();
    if (!this.audioCtx || !this.synthGain) return;

    this.isSynthesizing = true;
    if (this.onPlayCallback) this.onPlayCallback();

    if (this.synthStartTime === 0) {
      this.synthStartTime = Date.now();
    }

    // Determine scale based on track name
    const chordFrequencies = trackUri.includes('warm') 
      ? [261.63, 329.63, 392.00, 523.25] // C maj
      : trackUri.includes('night') 
      ? [220.00, 261.63, 329.63, 440.00] // A min
      : [174.61, 220.00, 261.63, 349.23]; // F maj

    let step = 0;
    const playNote = () => {
      if (!this.isSynthesizing || !this.audioCtx || !this.synthGain) return;

      const osc = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();
      const filter = this.audioCtx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, this.audioCtx.currentTime);

      const freq = chordFrequencies[step % chordFrequencies.length];
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      noteGain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.18, this.audioCtx.currentTime + 0.1);
      noteGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 1.8);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.synthGain);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 2.0);

      step++;
      const elapsed = (Date.now() - this.synthStartTime) / 1000;
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(elapsed, this.synthTrackDuration);
      }

      if (elapsed >= this.synthTrackDuration) {
        this.stopSynth();
        if (this.onEndCallback) this.onEndCallback();
        return;
      }

      this.synthTimer = setTimeout(playNote, 1200);
    };

    playNote();
  }

  private pauseSynth() {
    this.isSynthesizing = false;
    if (this.synthTimer) clearTimeout(this.synthTimer);
    if (this.onPauseCallback) this.onPauseCallback();
  }

  private stopSynth() {
    this.isSynthesizing = false;
    if (this.synthTimer) clearTimeout(this.synthTimer);
    this.synthStartTime = 0;
  }

  // Tactile Sound FX for Paper App experience: Warm, soothing cotton-parchment paper turn
  public playPageFlipSound() {
    try {
      this.initAudioCtx();
      if (!this.audioCtx) return;
      const ctx = this.audioCtx;
      const t = ctx.currentTime;

      // 1. Soft velvety pink noise for delicate paper-on-paper friction (cuts harsh high frequencies)
      const dur = 0.085; // 85ms delicate rustle
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
        data[i] = pink;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Warm lowpass filter (warm parchment resonance around 380Hz, NO irritating hiss!)
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      const variation = (Math.random() - 0.5) * 35;
      filter.frequency.setValueAtTime(390 + variation, t);
      filter.frequency.exponentialRampToValueAtTime(240 + variation, t + dur);
      filter.Q.value = 1.2;

      // Gentle, subtle volume curve (subtle ASMR level, gentle on ears)
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.035, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(t);
      noise.stop(t + dur);

      // 2. Microscopic warm tactile thump (heavy parchment landing on paper stack)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(90 + (Math.random() - 0.5) * 10, t + 0.025);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.025 + 0.045);

      oscGain.gain.setValueAtTime(0.001, t + 0.025);
      oscGain.gain.linearRampToValueAtTime(0.025, t + 0.03);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025 + 0.045);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);

      osc.start(t + 0.025);
      osc.stop(t + 0.025 + 0.05);
    } catch {}
  }

  public playPenClickSound() {
    try {
      this.initAudioCtx();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.frequency.setValueAtTime(2200, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.04);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    } catch {}
  }
}

export const audioEngine = new AudioEngine();
