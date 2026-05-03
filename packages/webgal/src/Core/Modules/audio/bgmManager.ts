import { setStage } from '@/store/stageReducer';
import { webgalStore } from '@/store/store';
import gsap from 'gsap';

class BgmManager {
  private static instance: BgmManager;

  public static getInstance(): BgmManager {
    if (!BgmManager.instance) {
      BgmManager.instance = new BgmManager();
    }
    return BgmManager.instance;
  }

  private audios: [HTMLAudioElement, HTMLAudioElement];
  private currentIndex = 0;
  private src = '';
  private targetVolume = 100;
  private progressListeners: Set<(p: { currentTime: number; duration: number }) => void> = new Set();

  private constructor() {
    this.audios = [new Audio(), new Audio()];
    this.audios.forEach((audio) => {
      audio.loop = true;
      audio.preload = 'auto';
      audio.crossOrigin = 'anonymous';
      audio.addEventListener('timeupdate', this.onTimeUpdate);
    });
  }

  /**
   * 播放bgm
   * @param options.src bgm路径
   * @param options.volume 背景音乐 音量调整（0 - 100）
   * @param options.enter 淡入时间（单位毫秒）
   * @param options.exit 淡出时间（单位毫秒）
   * @param options.loop 是否循环播放
   */
  public async play(
    options: { src?: string; volume?: number; enter?: number; exit?: number; loop?: boolean } = {},
  ): Promise<void> {
    const src = options.src ?? this.src;
    const enter = options.enter ?? 0;
    const exit = options.exit ?? enter;
    const volume = Math.max(0, Math.min(100, Math.trunc(options.volume ?? this.targetVolume)));
    const loop = options.loop ?? this.loop;

    this.targetVolume = volume;
    this.loop = loop;

    if (src === '') {
      await this.stop(exit);
      return;
    }

    webgalStore.dispatch(setStage({ key: 'bgm', value: { src, volume, enter, exit } }));

    if (src === this.src) {
      if (this.audio.paused) {
        this.audio.volume = 0;
        await this.audio.play();
      }
      await this.setVolume({ audio: this.audio, volume: this.targetVolume, duration: enter });
      return;
    }

    const oldIndex = this.currentIndex;
    const nextIndex = (this.currentIndex + 1) % 2;
    const oldAudio = this.audios[oldIndex];
    const nextAudio = this.audios[nextIndex];

    nextAudio.pause();
    nextAudio.src = src;
    nextAudio.volume = 0;

    try {
      nextAudio.load();
      await new Promise((resolve, reject) => {
        const cleanup = () => {
          nextAudio.removeEventListener('canplaythrough', onResolve);
          nextAudio.removeEventListener('error', onReject);
        };

        const onResolve = () => {
          cleanup();
          resolve(null);
        };

        const onReject = (e: Event) => {
          cleanup();
          reject(e);
        };
        nextAudio.addEventListener('canplaythrough', onResolve, { once: true });
        nextAudio.addEventListener('error', onReject, { once: true });
      });

      await nextAudio.play();
      this.currentIndex = nextIndex;

      if (enter > 0) {
        await Promise.all([
          this.setVolume({ audio: oldAudio, volume: 0, duration: exit, stopOnEnd: true }),
          this.setVolume({ audio: nextAudio, volume: this.targetVolume, duration: enter }),
        ]);
      } else {
        this.resetAudio(oldAudio);
      }

      this.src = src;
    } catch (e) {
      console.error('BGM Playback failed:', e);
      this.resetAudio(nextAudio);
    }
  }

  public async pause(value = 0): Promise<void> {
    if (value > 0) {
      await this.setVolume({ audio: this.audio, volume: 0, duration: value, pauseOnEnd: true });
    } else {
      this.audio.pause();
    }
  }

  public async stop(value = 0): Promise<void> {
    this.src = '';
    this.targetVolume = 100;
    webgalStore.dispatch(setStage({ key: 'bgm', value: { src: '', volume: 100, enter: 0, exit: 0 } }));
    if (value > 0) {
      await this.setVolume({ audio: this.audio, volume: 0, duration: value, stopOnEnd: true });
    } else {
      this.audios.forEach((_, i) => this.resetAudio(this.audios[i]));
    }
  }

  public async resume(value = 0): Promise<void> {
    return this.play({ enter: value });
  }

  public refreshVolume() {
    this.volume = this.targetVolume;
  }

  public addProgressListener(cb: (p: { currentTime: number; duration: number }) => void): () => void {
    this.progressListeners.add(cb);

    return () => {
      this.progressListeners.delete(cb);
    };
  }

  public clearListeners(): void {
    this.progressListeners.clear();
  }

  private get audio() {
    return this.audios[this.currentIndex];
  }

  public get currentTime() {
    return this.audio.currentTime;
  }
  public set currentTime(value: number) {
    this.audio.currentTime = value;
  }

  public get duration() {
    return this.audio.duration;
  }
  public get paused() {
    return this.audio.paused;
  }

  public get volume() {
    return this.targetVolume;
  }
  public set volume(value: number) {
    const volume = Math.max(0, Math.min(100, Math.trunc(value)));
    this.targetVolume = volume;

    const computedVolume = this.getComputedVolume(volume);

    const activeTweens = gsap.getTweensOf(this.audio, true);
    if (activeTweens.length > 0) {
      activeTweens.forEach((tween) => {
        tween.vars.volume = computedVolume;
        tween.invalidate();
      });
    } else {
      this.audio.volume = computedVolume;
    }
  }

  public get loop() {
    return this.audio.loop;
  }
  public set loop(value: boolean) {
    this.audios.forEach((a) => {
      a.loop = value;
    });
  }

  public getComputedVolume(value?: number): number {
    const { userData, stage } = webgalStore.getState();
    const { optionData } = userData;

    const main = optionData.volumeMain * 0.01;
    const group = optionData.bgmVolume * 0.01;
    const current = (value ?? stage.bgm.volume) * 0.01;

    return main * group * current;
  }

  private setVolume(options: {
    audio: HTMLAudioElement;
    volume: number;
    duration: number;
    stopOnEnd?: boolean;
    pauseOnEnd?: boolean;
  }): Promise<void> {
    const { audio, volume, duration, stopOnEnd, pauseOnEnd } = options;

    if (!audio.src || audio.src === '' || audio.src === window.location.href) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const computedVolume = this.getComputedVolume(volume);
      const vars: gsap.TweenVars = {
        volume: computedVolume,
        duration: duration / 1000,
        ease: computedVolume > audio.volume ? 'sine.out' : 'sine.in',
        overwrite: 'auto',
        onComplete: () => {
          if (stopOnEnd) this.resetAudio(audio);
          else if (pauseOnEnd) audio.pause();
          resolve();
        },
        onInterrupt: () => resolve(),
      };

      if (duration <= 0) {
        gsap.set(audio, vars);
      } else {
        gsap.to(audio, vars);
      }
    });
  }

  private onTimeUpdate = () => {
    if (this.src === '' || this.progressListeners.size === 0) return;
    const { currentTime, duration } = this.audio;
    this.progressListeners.forEach((listener) => listener({ currentTime, duration }));
  };

  private resetAudio(audio: HTMLAudioElement) {
    gsap.killTweensOf(audio);

    audio.pause();
    audio.volume = 0;
    audio.loop = true;

    audio.removeAttribute('src');
    audio.load();
  }
}

const bgmManager = BgmManager.getInstance();

export default bgmManager;
