import PixiStage from '@/Core/controller/stage/pixi/PixiController';
import { PerformController } from '@/Core/Modules/perform/performController';

/**
 * 游戏运行时变量
 */
export class Gameplay extends EventTarget {
  public autoInterval: ReturnType<typeof setInterval> | null = null;
  public fastInterval: ReturnType<typeof setInterval> | null = null;
  public autoTimeout: ReturnType<typeof setTimeout> | null = null;
  public pixiStage: PixiStage | null = null;
  public performController = new PerformController();
  // 自动播放
  private _isAuto = false;
  public get isAuto() {
    return this._isAuto;
  }
  public set isAuto(value: boolean) {
    this._isAuto = value;
    this.dispatchEvent(new CustomEvent('isAutoChange', { detail: value }));
  }
  // 快进
  private _isFast = false;
  public get isFast() {
    return this._isFast;
  }
  public set isFast(value: boolean) {
    this._isFast = value;
    this.dispatchEvent(new CustomEvent('isFastChange', { detail: value }));
  }

  public resetGamePlay() {
    this.isAuto = false;
    this.isFast = false;
    const autoInterval = this.autoInterval;
    if (autoInterval !== null) clearInterval(autoInterval);
    this.autoInterval = null;
    const fastInterval = this.fastInterval;
    if (fastInterval !== null) clearInterval(fastInterval);
    this.fastInterval = null;
    const autoTimeout = this.autoTimeout;
    if (autoTimeout !== null) clearInterval(autoTimeout);
    this.autoTimeout = null;
  }
}
