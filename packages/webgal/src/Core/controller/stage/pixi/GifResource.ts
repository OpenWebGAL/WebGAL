import { BaseImageResource, Ticker, UPDATE_PRIORITY, settings } from 'pixi.js';
import { parseGIF, decompressFrames } from 'gifuct-js';

export interface GifResourceOptions {
  autoLoad?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  animationSpeed?: number;
  fps?: number;
}

interface PrecomputedFrame {
  start: number;
  end: number;
  imageData: ImageData;
}

const findFrame = (frames: PrecomputedFrame[], time: number) => {
  let low = 0;
  let high = frames.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    const f = frames[mid];
    if (time >= f.start && time < f.end) return f;
    if (time < f.start) high = mid - 1;
    else low = mid + 1;
  }
  return undefined;
};

export class GifResource extends BaseImageResource {
  public static override test(_src: unknown, ext?: string): boolean {
    return (
      ext === 'gif' ||
      (typeof _src === 'string' && _src.trim().toLowerCase().endsWith('.gif')) ||
      (_src instanceof HTMLImageElement && _src.src.toLowerCase().endsWith('.gif'))
    );
  }

  public declare source: HTMLCanvasElement;

  public autoPlay: boolean;
  public loop: boolean;
  public animationSpeed: number;
  public readonly fps: number;
  public readonly url: string = '';

  private _frames: PrecomputedFrame[] = [];
  private _currentTime = 0;
  private _playing = false;
  private _loadPromise: Promise<this> | null = null;

  public constructor(src: unknown, options: GifResourceOptions = {}) {
    super(document.createElement('canvas'));
    if (typeof src === 'string') this.url = src;
    else if (src instanceof HTMLImageElement) this.url = src.src;
    this.autoPlay = options.autoPlay ?? true;
    this.loop = options.loop ?? true;
    this.animationSpeed = options.animationSpeed ?? 1;
    this.fps = options.fps ?? 30;

    if (options.autoLoad !== false) this.load();
  }

  public override async load(): Promise<this> {
    if (this._loadPromise) return this._loadPromise;

    this._loadPromise = (async () => {
      const res = await settings.ADAPTER.fetch(this.url);
      const buffer = await res.arrayBuffer();

      if (!buffer?.byteLength) throw new Error('Invalid GIF buffer');

      const gif = parseGIF(buffer);
      const gifFrames = decompressFrames(gif, true);
      if (!gifFrames.length) throw new Error('Invalid GIF file');

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
      const patchCanvas = document.createElement('canvas');
      const patchCtx = patchCanvas.getContext('2d')!;

      canvas.width = gif.lsd.width;
      canvas.height = gif.lsd.height;

      let time = 0;
      let prevFrame: ImageData | null = null;
      const defaultDelay = 1000 / this.fps;

      for (const frame of gifFrames) {
        const { dims, delay = defaultDelay, disposalType = 2, patch } = frame;
        const { width, height, left, top } = dims;

        patchCanvas.width = width;
        patchCanvas.height = height;
        const patchData = new ImageData(new Uint8ClampedArray(patch), width, height);
        patchCtx.putImageData(patchData, 0, 0);

        ctx.drawImage(patchCanvas, left, top);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        this._frames.push({ start: time, end: (time += delay), imageData });

        if (disposalType === 2) ctx.clearRect(0, 0, canvas.width, canvas.height);
        else if (disposalType === 3 && prevFrame) ctx.putImageData(prevFrame, 0, 0);

        prevFrame = imageData;
      }

      this.source.width = canvas.width;
      this.source.height = canvas.height;
      super.update();

      if (this.autoPlay) this.play();

      return this;
    })();

    return this._loadPromise;
  }

  public play(): void {
    if (this._playing) return;
    this._playing = true;
    Ticker.shared.add(this._update, this, UPDATE_PRIORITY.HIGH);
  }

  public stop(): void {
    if (!this._playing) return;
    this._playing = false;
    Ticker.shared.remove(this._update, this);
  }

  public override dispose(): void {
    this.stop();
    super.dispose();
    this._frames = [];
    this._loadPromise = null;
  }

  private _update(): void {
    if (!this._playing || !this._frames.length) return;

    this._currentTime += Ticker.shared.deltaMS * this.animationSpeed;
    const frame = findFrame(this._frames, this._currentTime);

    if (frame) {
      this.source.getContext('2d')!.putImageData(frame.imageData, 0, 0);
      super.update();
    }

    const end = this._frames[this._frames.length - 1].end;
    if (this._currentTime > end) {
      if (this.loop) this._currentTime %= end;
      else this.stop();
    }
  }
}
