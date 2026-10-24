class RetroSynthesizer {
  private getContext: () => AudioContext | null;
  private isPlaying = false;
  private stepInterval: any = null;
  private stepIndex = 0;
  private masterGain: GainNode | null = null;

  constructor(getContext: () => AudioContext | null) {
    this.getContext = getContext;
  }

  public start(chapter = 1, volume = 0.22): void {
    this.stop();
    this.isPlaying = true;
    this.stepIndex = 0;

    const ctx = this.getContext();
    if (!ctx) return;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    this.masterGain.connect(ctx.destination);

    // Chords and progressions per epoch/chapter
    // Peaceful: C (261.63), G (392.00), Am (440.00), F (349.23)
    // Dramatic: Am (220.00), F (174.61), C (261.63), G (196.00)
    const isDramatic = chapter >= 5;
    const chordProgressions = isDramatic
      ? [
          [220.0, 261.63, 329.63], // Am
          [174.61, 220.0, 261.63], // F
          [261.63, 329.63, 392.0], // C
          [196.0, 246.94, 293.66], // G
        ]
      : [
          [261.63, 329.63, 392.0], // C
          [196.0, 246.94, 293.66], // G
          [220.0, 261.63, 329.63], // Am
          [174.61, 220.0, 261.63], // F
        ];

    const leadMelody = isDramatic
      ? [440, 523.25, 440, 392, 349.23, 392, 440, 329.63]
      : [523.25, 659.25, 587.33, 523.25, 392, 440, 523.25, 587.33];

    // 16th note step: 180ms (~83 BPM)
    const stepDuration = 0.18;

    this.stepInterval = setInterval(() => {
      if (!this.isPlaying) return;
      const actx = this.getContext();
      if (!actx || !this.masterGain) return;

      const chordIdx = Math.floor(this.stepIndex / 4) % chordProgressions.length;
      const currentChord = chordProgressions[chordIdx];
      const arpNote = currentChord[this.stepIndex % 3];
      const leadNote = leadMelody[Math.floor(this.stepIndex / 2) % leadMelody.length];
      const bassNote = currentChord[0] / 2;

      const now = actx.currentTime;

      // 1. Arpeggio Voice (gentle rolling 16th notes)
      const arpOsc = actx.createOscillator();
      const arpGain = actx.createGain();
      arpOsc.type = 'triangle';
      arpOsc.frequency.setValueAtTime(arpNote, now);
      arpGain.gain.setValueAtTime(0.08, now);
      arpGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 0.9);
      arpOsc.connect(arpGain);
      arpGain.connect(this.masterGain);
      arpOsc.start(now);
      arpOsc.stop(now + stepDuration);

      // 2. Bass Voice (on beats 0 and 2 of each chord)
      if (this.stepIndex % 4 === 0) {
        const bassOsc = actx.createOscillator();
        const bassGain = actx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassNote, now);
        bassGain.gain.setValueAtTime(0.18, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + stepDuration * 3.8);
        bassOsc.connect(bassGain);
        bassGain.connect(this.masterGain);
        bassOsc.start(now);
        bassOsc.stop(now + stepDuration * 4);
      }

      // 3. Lead Melody Voice (every 2 steps)
      if (this.stepIndex % 2 === 0) {
        const leadOsc = actx.createOscillator();
        const leadGain = actx.createGain();
        leadOsc.type = isDramatic ? 'sawtooth' : 'triangle';
        leadOsc.frequency.setValueAtTime(leadNote, now);
        leadGain.gain.setValueAtTime(0.07, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.8);
        leadOsc.connect(leadGain);
        leadGain.connect(this.masterGain);
        leadOsc.start(now);
        leadOsc.stop(now + stepDuration * 2);
      }

      this.stepIndex++;
    }, stepDuration * 1000);
  }

  public setVolume(vol: number): void {
    if (this.masterGain && this.getContext()) {
      const actx = this.getContext()!;
      this.masterGain.gain.setValueAtTime(vol, actx.currentTime);
    }
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.stepInterval) {
      clearInterval(this.stepInterval);
      this.stepInterval = null;
    }
    if (this.masterGain) {
      try {
        this.masterGain.disconnect();
      } catch {}
      this.masterGain = null;
    }
  }
}

class SoundSystem {
  private ctx: AudioContext | null = null;
  public muted = false;
  public bgmMuted = false;
  private bgmAudio: HTMLAudioElement | null = null;
  private synth: RetroSynthesizer;
  private bgmVolume = 0.28;
  private currentChapter = 1;

  constructor() {
    this.synth = new RetroSynthesizer(() => this.getContext());
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('snes_bgm_muted') ?? localStorage.getItem('germanen_bgm_muted');
      if (savedMute !== null) this.bgmMuted = savedMute === 'true';
      const savedVol = localStorage.getItem('snes_bgm_vol') ?? localStorage.getItem('germanen_bgm_vol');
      if (savedVol !== null) {
        const v = parseFloat(savedVol);
        if (!isNaN(v)) this.bgmVolume = Math.max(0, Math.min(1, v));
      }
    }
  }

  private getContext(): AudioContext | null {
    if (this.muted) return null;
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

  public getVolume(): number {
    return this.bgmVolume;
  }

  public setVolume(val: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, val));
    if (typeof window !== 'undefined') {
      localStorage.setItem('snes_bgm_vol', String(this.bgmVolume));
    }
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmMuted ? 0 : this.bgmVolume;
    }
    this.synth.setVolume(this.bgmMuted ? 0 : this.bgmVolume * 0.8);
  }

  public getChapterTrackInfo(chapter = 1): { path: string; title: string; subtitle: string } {
    const map: Record<number, { path: string; title: string; subtitle: string }> = {
      1: {
        path: '/assets/audio/bgm/bgm_warmth.mp3',
        title: 'Die Wiege im Langhaus',
        subtitle: 'Sippenfriede, Weidevieh & Spelzernte (10 v. Chr.)',
      },
      2: {
        path: '/assets/audio/bgm/bgm_patterns.mp3',
        title: 'Feuer und Raseneisen',
        subtitle: 'Der Rhythmus der Hämmer am Rennofen (5 v. Chr.)',
      },
      3: {
        path: '/assets/audio/bgm/bgm_heart.mp3',
        title: 'Händler an der Lippe',
        subtitle: 'Waldgirmes, Bernstein & Terra Sigillata (4 n. Chr.)',
      },
      4: {
        path: '/assets/audio/bgm/bgm_oracle.mp3',
        title: 'Der Schwur unter der Eiche',
        subtitle: 'Das Thing, Wergeld & Sippenehre (7 n. Chr.)',
      },
      5: {
        path: '/assets/audio/bgm/bgm_mist.mp3',
        title: 'Die Nebel des Heiligen Moores',
        subtitle: 'Die Seherin Albruna & Mooropfer (8 n. Chr.)',
      },
      6: {
        path: '/assets/audio/bgm/bgm_desert_epic.mp3',
        title: 'Der Pass von Kalkriese',
        subtitle: 'Die Varusschlacht & das Schicksal Roms (9 n. Chr.)',
      },
      7: {
        path: '/assets/audio/bgm/bgm_desert_whispers.mp3',
        title: 'Wachtürme am Limes',
        subtitle: 'Zollkontrolle, Signale & der Kastell-Vicus (140 n. Chr.)',
      },
      8: {
        path: '/assets/audio/bgm/bgm_heart.mp3',
        title: 'Das Erbe der Föderaten',
        subtitle: 'Aufbruch der Großstämme in die Spätantike (350 n. Chr.)',
      },
    };
    return map[chapter] || map[1];
  }

  public playBGM(chapter = 1): void {
    this.currentChapter = chapter;
    const track = this.getChapterTrackInfo(chapter);

    if (this.bgmAudio) {
      if (this.bgmAudio.src.endsWith(track.path)) {
        if (this.bgmAudio.paused && !this.bgmMuted) {
          this.bgmAudio.play().catch(() => this.playSynthBGM(chapter));
        }
        return;
      }
      this.bgmAudio.pause();
      this.bgmAudio = null;
    }

    try {
      this.bgmAudio = new Audio(track.path);
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = this.bgmMuted ? 0 : this.bgmVolume;
      this.bgmAudio.onerror = () => {
        // Fallback to procedural 16-Bit chiptune synth if MP3 not found
        this.playSynthBGM(chapter);
      };
      const playPromise = this.bgmAudio.play();
      if (playPromise) {
        playPromise.catch(() => {
          // If browser blocks audio, synth is ready on user gesture
        });
      }
    } catch {
      this.playSynthBGM(chapter);
    }
  }

  public playSynthBGM(chapter = 1): void {
    if (this.bgmMuted) return;
    this.synth.start(chapter, this.bgmVolume * 0.8);
  }

  public toggleBGM(): boolean {
    this.bgmMuted = !this.bgmMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('snes_bgm_muted', String(this.bgmMuted));
    }
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmMuted ? 0 : this.bgmVolume;
      if (!this.bgmMuted && this.bgmAudio.paused) {
        this.bgmAudio.play().catch(() => this.playSynthBGM(this.currentChapter));
      }
    } else if (!this.bgmMuted) {
      this.playBGM(this.currentChapter);
    }

    if (this.bgmMuted) {
      this.synth.stop();
    }
    return !this.bgmMuted;
  }

  public stopBGM(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
    }
    this.synth.stop();
  }

  // --- 16-BIT RETRO WEBAUDIO SOUND SYNTHESIZER ---

  public playClick(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  public playCollect(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.05);
      gain.gain.setValueAtTime(0.12, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.08);
    });
  }

  public playCraft(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Anvil hit sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playQuest(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Major chord chime
    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  }

  public playRelic(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Ancient brass trumpet fanfare
    [329.63, 440, 554.37, 659.25, 880, 1108.73].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.14, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.38);
    });
  }

  public playSignalHorn(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(277.18, now + 0.35);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  public playPet(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [392.0, 523.25, 659.25].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.14, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.16);
    });
  }
}

export const sound = new SoundSystem();
