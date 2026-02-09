import PixiStage from '@/Core/controller/stage/pixi/PixiController';
import { PerformController } from '@/Core/Modules/perform/performController';
import { setFastButton } from '../controller/gamePlay/fastSkip';
import { setAutoButton } from '../controller/gamePlay/autoPlay';

/**
 * 游戏运行时变量
 */
export class Gameplay {
  public autoInterval: ReturnType<typeof setInterval> | null = null;
  public fastInterval: ReturnType<typeof setInterval> | null = null;
  public autoTimeout: ReturnType<typeof setTimeout> | null = null;
  public pixiStage: PixiStage | null = null;
  public performController = new PerformController();

  /* 有图标状态需求 */
  private _isAuto = false;
  public get isAuto() {
    return this._isAuto;
  }
  public set isAuto(value: boolean) {
    this._isAuto = value;
    setAutoButton(value);
  }
  private _isFast = false;
  public get isFast() {
    return this._isFast;
  }
  public set isFast(value: boolean) {
    this._isFast = value;
    setFastButton(value);
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
