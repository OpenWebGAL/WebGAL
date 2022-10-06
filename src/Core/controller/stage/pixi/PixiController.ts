import * as PIXI from 'pixi.js';

export default class PixiStage {
  /**
   * 当前的 PIXI App
   */
  public currentApp: PIXI.Application | null = null;
  public effectsContainer: PIXI.Container;
  public figureContainer: PIXI.Container;
  public backgroundContainer: PIXI.Container;

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
}
