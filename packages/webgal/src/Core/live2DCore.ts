/**
 * 眨眼参数，毫秒
 */
export interface BlinkParam {
  blinkInterval: number; // 眨眼间隔
  blinkIntervalRandom: number; // 眨眼间隔随机范围
  closingDuration: number; // 闭眼
  closedDuration: number; // 保持闭眼
  openingDuration: number; // 睁眼
}

export const baseBlinkParam: BlinkParam = {
  blinkInterval: 24 * 60 * 60 * 1000, // 24小时
  blinkIntervalRandom: 1000,
  closingDuration: 100,
  closedDuration: 50,
  openingDuration: 150,
};

export class Live2DCore {
  public isAvailable = false;

  public Live2DModel: any;
  public SoundManager: any;
  public Config: any;

  public constructor() {
    this.initLive2D();
  }

  private async initLive2D() {
    try {
      const { Live2DModel, SoundManager, config } = await import('pixi-live2d-display-webgal');
      this.Live2DModel = Live2DModel;
      this.SoundManager = SoundManager;
      this.Config = config;
      this.isAvailable = true;
      console.info('live2d lib load success');
    } catch (error) {
      this.isAvailable = false;
      console.info('live2d lib load failed', error);
    }
  }
}
