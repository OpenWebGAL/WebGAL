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
  private activeIndex = 0;
  private progressListeners: Set<(p: { current: number; total: number; ratio: number }) => void> = new Set();

  private constructor() {
    this.audios = [new Audio(), new Audio()];
    this.audios.forEach((audio, index) => {
      audio.loop = true;
      audio.crossOrigin = 'anonymous';
      audio.addEventListener('timeupdate', () => this.handleTimeUpdate(index));
    });
  }

  public async play(src: string, options: { volume: number; fade: number }) {
    const nextIndex = (this.activeIndex + 1) % 2;
    const currentAudio = this.audios[this.activeIndex];

    if (currentAudio.src === src) {
      if (currentAudio.paused) {
        await this.resume(options);
      }
      return;
    }

    const nextAudio = this.audios[nextIndex];

    nextAudio.src = src;
    nextAudio.volume = 0;

    try {
      await nextAudio.play();

      this.activeIndex = nextIndex;

      gsap.killTweensOf(currentAudio, 'volume');
      gsap.to(currentAudio, {
        volume: 0,
        duration: options.fade / 1000,
        ease: 'sine.in',
        onComplete: () => currentAudio.pause(),
      });

      gsap.killTweensOf(nextAudio, 'volume');
      gsap.to(nextAudio, {
        volume: options.volume,
        duration: options.fade / 1000,
        ease: 'sine.out',
      });
    } catch (err) {
      console.error('BGM Playback failed:', err);
    }
  }

  public async pause(options: { fade: number }) {
    const currentAudio = this.audios[this.activeIndex];
    gsap.killTweensOf(currentAudio, 'volume');
    await gsap.to(currentAudio, {
      volume: 0,
      duration: options.fade / 1000,
      ease: 'sine.in',
      onComplete: () => currentAudio.pause(),
    });
  }

  public async resume(options: { volume: number; fade: number }) {
    const currentAudio = this.audios[this.activeIndex];
    gsap.killTweensOf(currentAudio, 'volume');
    await gsap.to(currentAudio, {
      volume: options.volume,
      duration: options.fade / 1000,
      ease: 'sine.out',
    });
  }

  public async stop(options: { fade: number }) {
    const currentAudio = this.audios[this.activeIndex];
    gsap.killTweensOf(currentAudio, 'volume');
    await gsap.to(currentAudio, {
      volume: 0,
      duration: options.fade / 1000,
      ease: 'sine.in',
      onComplete: () => {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      },
    });
  }

  public subscribeProgress(cb: (p: any) => void) {
    this.progressListeners.add(cb);
    return () => this.progressListeners.delete(cb);
  }

  private handleTimeUpdate(index: number) {
    if (index !== this.activeIndex) return;
    const audio = this.audios[index];
    const data = {
      current: audio.currentTime,
      total: audio.duration || 0,
      ratio: audio.currentTime / (audio.duration || 1),
    };
    this.progressListeners.forEach((cb) => cb(data));
  }
}

export const bgmManager = BgmManager.getInstance();
