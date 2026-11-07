/**
 * MusicManager.ts — Germanen (ca. 10 v. Chr. – 350 n. Chr.)
 * Dynamischer Kapitel-BGM Crossfader mit MP3-Wiedergabe und
 * prozeduralem 16-Bit WebAudio Chiptune Fallback.
 */

const CHAPTER_TRACK_MAP: Record<number, string> = {
  1: 'bgm_warmth',
  2: 'bgm_patterns',
  3: 'bgm_desert_epic',
  4: 'bgm_oracle',
  5: 'bgm_mist',
  6: 'bgm_desert_whispers',
  7: 'bgm_heart',
  8: 'bgm_warmth',
};

export class MusicManager {
  private currentAudio: HTMLAudioElement | null = null;
  private currentTrackId: string | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.3;
  private fallbackCtx: AudioContext | null = null;
  private fallbackInterval: number | null = null;

  constructor() {
    const saved = localStorage.getItem('german_music_muted');
    if (saved === 'true') {
      this.isMuted = true;
    }
  }

  public playChapterMusic(trackOrChapter: string | number | any): void {
    let trackId = 'bgm_warmth';
    if (typeof trackOrChapter === 'number') {
      trackId = CHAPTER_TRACK_MAP[trackOrChapter] || 'bgm_warmth';
    } else if (typeof trackOrChapter === 'string') {
      trackId = CHAPTER_TRACK_MAP[Number(trackOrChapter)] || trackOrChapter || 'bgm_warmth';
    } else if (trackOrChapter && typeof trackOrChapter === 'object') {
      if (trackOrChapter.music?.trackId) trackId = trackOrChapter.music.trackId;
      else if (trackOrChapter.trackId) trackId = trackOrChapter.trackId;
      else if (trackOrChapter.id) trackId = CHAPTER_TRACK_MAP[trackOrChapter.id] || 'bgm_warmth';
    }

    if (this.currentTrackId === trackId && (this.currentAudio || this.fallbackInterval)) return;
    this.currentTrackId = trackId;

    this.stopFallback();
    if (this.currentAudio) {
      const oldAudio = this.currentAudio;
      this.fadeOutAndStop(oldAudio);
      this.currentAudio = null;
    }

    if (this.isMuted) return;

    const audio = new Audio(`/assets/audio/bgm/${trackId}.mp3`);
    audio.loop = true;
    audio.volume = 0;

    audio
      .play()
      .then(() => {
        this.currentAudio = audio;
        this.fadeIn(audio);
      })
      .catch(() => {
        this.startFallbackChiptune(trackId);
      });
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('german_music_muted', String(this.isMuted));
    if (this.isMuted) {
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }
      this.stopFallback();
    } else {
      if (this.currentTrackId) {
        const tid = this.currentTrackId;
        this.currentTrackId = null;
        this.playChapterMusic(tid);
      } else {
        this.playChapterMusic(1);
      }
    }
    return !this.isMuted;
  }

  public get muted(): boolean {
    return this.isMuted;
  }

  private fadeIn(audio: HTMLAudioElement): void {
    let vol = 0;
    const target = this.volume;
    const timer = setInterval(() => {
      vol = Math.min(target, vol + 0.03);
      audio.volume = vol;
      if (vol >= target) clearInterval(timer);
    }, 50);
  }

  private fadeOutAndStop(audio: HTMLAudioElement): void {
    let vol = audio.volume;
    const timer = setInterval(() => {
      vol = Math.max(0, vol - 0.05);
      audio.volume = vol;
      if (vol <= 0) {
        clearInterval(timer);
        audio.pause();
      }
    }, 40);
  }

  private startFallbackChiptune(trackId: string): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.fallbackCtx) this.fallbackCtx = new AudioCtx();
      if (this.fallbackCtx.state === 'suspended') {
        this.fallbackCtx.resume();
      }

      // Pentatonic archaic folk scale (D Dorian: D, E, F, G, A, B, C)
      const scale = [220.0, 246.94, 261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 523.25];
      let step = 0;

      this.fallbackInterval = window.setInterval(() => {
        if (!this.fallbackCtx || this.isMuted) return;
        const now = this.fallbackCtx.currentTime;
        const osc = this.fallbackCtx.createOscillator();
        const gain = this.fallbackCtx.createGain();

        // 16-Bit triangle / warm pulse wave
        osc.type = step % 4 === 0 ? 'triangle' : 'sine';
        const noteIdx = (step * 3 + (step % 2)) % scale.length;
        osc.frequency.setValueAtTime(scale[noteIdx], now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.045, now + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

        osc.connect(gain);
        gain.connect(this.fallbackCtx.destination);

        osc.start(now);
        osc.stop(now + 0.45);
        step++;
      }, 340);
    } catch {
      // AudioContext unavailable
    }
  }

  private stopFallback(): void {
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
  }
}

export const music = new MusicManager();
