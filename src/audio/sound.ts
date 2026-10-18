class SoundSystem {
  private ctx: AudioContext | null = null;
  public muted = false;
  public bgmMuted = false;
  private bgmAudio: HTMLAudioElement | null = null;
  private bgmVolume = 0.28;
  private currentChapter = 1;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('germanen_bgm_muted');
      if (savedMute !== null) this.bgmMuted = savedMute === 'true';
      const savedVol = localStorage.getItem('germanen_bgm_vol');
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
      localStorage.setItem('germanen_bgm_vol', String(this.bgmVolume));
    }
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmMuted ? 0 : this.bgmVolume;
    }
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
          this.bgmAudio.play().catch(() => {});
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
      const playPromise = this.bgmAudio.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Auto-play was prevented; will resume on first user interaction
        });
      }
    } catch {
      // Audio load error ignored
    }
  }

  public toggleBGM(): boolean {
    this.bgmMuted = !this.bgmMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('germanen_bgm_muted', String(this.bgmMuted));
    }
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmMuted ? 0 : this.bgmVolume;
      if (!this.bgmMuted && this.bgmAudio.paused) {
        this.bgmAudio.play().catch(() => {});
      }
    } else if (!this.bgmMuted) {
      this.playBGM(this.currentChapter);
    }
    return !this.bgmMuted;
  }

  public stopBGM(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
    }
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
}

export const sound = new SoundSystem();
