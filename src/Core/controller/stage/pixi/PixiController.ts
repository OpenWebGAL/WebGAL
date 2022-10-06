import * as PIXI from 'pixi.js';

interface ITickerFunc {
  key: string;
  func: PIXI.TickerCallback<number>;
}

interface ITransformFunc {
  key: string;
  targetId: string;
  func: Function;
}

export default class PixiStage {
  /**
   * 当前的 PIXI App
   */
  public currentApp: PIXI.Application | null = null;
  public effectsContainer: PIXI.Container;
  public figureContainer: PIXI.Container;
  public backgroundContainer: PIXI.Container;
  // 注册到 Ticker 上的函数
  public tickerFuncs: Array<ITickerFunc> = [];
  // 要执行的变换操作
  public transformFuncs: Array<ITransformFunc> = [];
  // 锁定变换对象（对象可能正在执行动画，不能应用变换）
  private LockTransformTarget: Array<string> = [];

  public constructor() {
    const app = new PIXI.Application({
      backgroundAlpha: 0,
      preserveDrawingBuffer: true,
    });
    // 清空原节点
    const pixiContainer = document.getElementById('pixiContianer');
    if (pixiContainer) {
      pixiContainer.innerHTML = '';
      pixiContainer.appendChild(app.view);
    }

    // 设置样式
    app.renderer.view.style.position = 'absolute';
    app.renderer.view.style.display = 'block';
    app.renderer.view.id = 'pixiCanvas';
    // @ts-ignore
    app.renderer.autoResize = true;
    const appRoot = document.getElementById('root');
    if (appRoot) {
      app.renderer.resize(appRoot.clientWidth, appRoot.clientHeight);
    }
    app.renderer.view.style.zIndex = '5';

    // 设置可排序
    app.stage.sortableChildren = true;

    // 添加 3 个 Container 用于做渲染
    this.effectsContainer = new PIXI.Container();
    this.effectsContainer.zIndex = 3;
    this.figureContainer = new PIXI.Container();
    this.effectsContainer.zIndex = 2;
    this.backgroundContainer = new PIXI.Container();
    this.backgroundContainer.zIndex = 0;
    app.stage.addChild(this.effectsContainer, this.figureContainer, this.backgroundContainer);
    this.currentApp = app;
  }

  public registerTicker(tickerFn: PIXI.TickerCallback<number>, key: string) {
    this.tickerFuncs.push({ func: tickerFn, key: key });
    this.currentApp?.ticker.add(tickerFn);
  }

  public removeTicker(key: string) {
    const index = this.tickerFuncs.findIndex((e) => e.key === key);
    if (index >= 0) {
      const thisTickerFunc = this.tickerFuncs[index];
      this.currentApp?.ticker.remove(thisTickerFunc.func);
      this.tickerFuncs.splice(index, 1);
    }
  }
}
