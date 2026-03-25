import gsap from 'gsap';

class BgmManager {
  private static instance: BgmManager;

  public static getInstance(): BgmManager {
    if (!BgmManager.instance) {
      BgmManager.instance = new BgmManager();
    }
    return BgmManager.instance;
  }

  private _audios: [HTMLAudioElement, HTMLAudioElement];
  private _currentIndex = 0;
  private _targetVolume = 1;
  private _loop = true;
  private _muted = false;
  private _progressListeners: Set<(p: { currentTime: number; duration: number }) => void> = new Set();

  private constructor() {
    this._audios = [new Audio(), new Audio()];
    this._audios.forEach((audio) => {
      audio.loop = this._loop;
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      audio.addEventListener('timeupdate', this._onTimeUpdate);
    });
  }

  public async play(options: { src?: string; loop?: boolean; volume?: number; fade?: number } = {}): Promise<void> {
    const fade = options.fade ?? 0;
    if (options.volume !== undefined) this._targetVolume = options.volume;
    if (options.loop !== undefined) this.loop = options.loop;

    if (!options.src) {
      const current = this._audio;
      if (current.src) {
        if (current.paused) {
          current.volume = 0;
          await current.play();
        }
        await this._setVolume({ index: this._currentIndex, volume: this._targetVolume, fade });
      }
      return;
    }

    const oldIndex = this._currentIndex;
    const nextIndex = (this._currentIndex + 1) % 2;
    const oldAudio = this._audios[oldIndex];
    const nextAudio = this._audios[nextIndex];

    nextAudio.src = options.src;
    nextAudio.volume = fade > 0 ? 0 : this._targetVolume;
    nextAudio.muted = this._muted;

    try {
      nextAudio.load();
      await new Promise((resolve, reject) => {
        const onCanPlay = () => {
          nextAudio.removeEventListener('error', onError);
          resolve(null);
        };
        const onError = (e: any) => {
          nextAudio.removeEventListener('canplaythrough', onCanPlay);
          reject(e);
        };
        nextAudio.addEventListener('canplaythrough', onCanPlay, { once: true });
        nextAudio.addEventListener('error', onError, { once: true });
      });

      await nextAudio.play();
      this._currentIndex = nextIndex;

      if (fade > 0) {
        await Promise.all([
          this._setVolume({ index: oldIndex, volume: 0, fade, stopOnEnd: true }),
          this._setVolume({ index: nextIndex, volume: this._targetVolume, fade }),
        ]);
      } else {
        this._stopAudio(oldAudio);
      }
    } catch (e) {
      console.error('BGM Playback failed:', e);
      this._stopAudio(nextAudio);
    }
  }

  public async pause({ fade = 0 }: { fade?: number }): Promise<void> {
    if (fade > 0) {
      await this._setVolume({ index: this._currentIndex, volume: 0, fade, pauseOnEnd: true });
    } else {
      this._audio.pause();
    }
  }

  public async stop({ fade = 0 }: { fade?: number }): Promise<void> {
    if (fade > 0) {
      await this._setVolume({ index: this._currentIndex, volume: 0, fade, stopOnEnd: true });
    } else {
      this._audios.forEach((_, i) => this._stopAudio(this._audios[i]));
    }
  }

  public async fade({ volume, fade = 0 }: { volume: number; fade?: number }): Promise<void> {
    this._targetVolume = volume;
    return this._setVolume({ index: this._currentIndex, volume, fade });
  }

  public async resume({ fade = 0 }: { fade?: number }): Promise<void> {
    return this.play({ fade });
  }

  public addProgressListener(cb: (p: { currentTime: number; duration: number }) => void): () => void {
    this._progressListeners.add(cb);

    return () => {
      this._progressListeners.delete(cb);
    };
  }

  public clearListeners(): void {
    this._progressListeners.clear();
  }

  private get _audio() {
    return this._audios[this._currentIndex];
  }

  public get currentTime() {
    return this._audio.currentTime;
  }
  public set currentTime(value: number) {
    this._audio.currentTime = value;
  }

  public get duration() {
    return this._audio.duration;
  }
  public get paused() {
    return this._audio.paused;
  }

  public get volume() {
    return this._targetVolume;
  }
  public set volume(value: number) {
    this._targetVolume = value;
    gsap.killTweensOf(this._audio, 'volume');
    this._audio.volume = Math.max(0, Math.min(1, value));
  }

  public get loop() {
    return this._loop;
  }
  public set loop(value: boolean) {
    this._loop = value;
    this._audios.forEach((a) => {
      a.loop = value;
    });
  }

  public get muted() {
    return this._muted;
  }
  public set muted(value: boolean) {
    this._muted = value;
    this._audios.forEach((a) => {
      a.muted = value;
    });
  }

  private _setVolume(params: {
    index: number;
    volume: number;
    fade: number;
    stopOnEnd?: boolean;
    pauseOnEnd?: boolean;
  }): Promise<void> {
    const { index, volume, fade, stopOnEnd, pauseOnEnd } = params;

    const audio = this._audios[index];

    if (!audio.src || audio.src === window.location.href) {
      return Promise.resolve();
    }

    gsap.killTweensOf(audio, 'volume');

    return new Promise((resolve) => {
      if (fade <= 0) {
        audio.volume = volume;
        if (stopOnEnd) this._stopAudio(audio);
        else if (pauseOnEnd) audio.pause();
        resolve();
        return;
      }

      gsap.to(audio, {
        volume,
        duration: fade / 1000,
        ease: volume > audio.volume ? 'sine.out' : 'sine.in',
        overwrite: 'auto',
        onComplete: () => {
          if (stopOnEnd) this._stopAudio(audio);
          else if (pauseOnEnd) audio.pause();
          resolve();
        },
        onInterrupt: () => resolve(),
      });
    });
  }

  private _onTimeUpdate = () => {
    if (!this._audio.src || this._progressListeners.size === 0) return;
    const { currentTime, duration } = this._audio;
    this._progressListeners.forEach((listener) => listener({ currentTime, duration }));
  };

  private _stopAudio(audio: HTMLAudioElement) {
    gsap.killTweensOf(audio, 'volume');
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
  }
}

export const bgmManager = BgmManager.getInstance();
