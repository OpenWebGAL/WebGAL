import * as PIXI from 'pixi.js';
import { generateBgSoftInFn } from '@/Core/controller/stage/pixi/animations/bgSoftIn';
import { logger } from '@/Core/util/etc/logger';

interface ITickerFunc {
  key: string;
  targetKey?: string;
  func: PIXI.TickerCallback<number>;
}

interface ITransformFunc {
  key: string;
  targetKey: string;
  func: Function;
}

interface IFigure {
  key: string;
  pixiSprite: PIXI.Sprite;
  url: string;
}

interface IBackground {
  key: string;
  pixiSprite: PIXI.Sprite;
  url: string;
}

export default class PixiStage {
  /**
   * 当前的 PIXI App
   */
  public currentApp: PIXI.Application | null = null;
  public effectsContainer: PIXI.Container;
  public figureContainer: PIXI.Container;
  public figureObjects: Array<IFigure> = [];
  public backgroundContainer: PIXI.Container;
  public backgroundObjects: Array<IBackground> = [];
  // 注册到 Ticker 上的函数
  public tickerFuncs: Array<ITickerFunc> = [];
  // 要执行的变换操作
  public transformFuncs: Array<ITransformFunc> = [];
  // 锁定变换对象（对象可能正在执行动画，不能应用变换）
  private LockTransformTarget: Array<string> = [];
  private stageWidth = 2560;
  private stageHeight = 1440;

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
    this.figureContainer.zIndex = 2;
    this.backgroundContainer = new PIXI.Container();
    this.backgroundContainer.zIndex = 0;
    app.stage.addChild(this.effectsContainer, this.figureContainer, this.backgroundContainer);
    this.currentApp = app;
  }

  public registerTicker(tickerFn: PIXI.TickerCallback<number>, key: string, target = 'defalut') {
    this.tickerFuncs.push({ func: tickerFn, key: key, targetKey: target });
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

  public addBg(key: string, url: string) {
    return new Promise<boolean>((resolve) => {
      const loader = new PIXI.Loader();

      // 完成图片加载后执行的函数
      const setup = () => {
        const texture = loader.resources[url].texture!;
        const isBgSet = this.backgroundObjects.findIndex((e) => e.key === key) >= 0;
        if (texture && !isBgSet) {
          /**
           * 重设大小
           */
          const originalWidth = texture.width;
          const originalHeight = texture.height;
          const scaleX = this.stageWidth / originalWidth;
          const scaleY = this.stageHeight / originalHeight;
          const targetScale = Math.max(scaleX, scaleY);
          const bgSprite = new PIXI.Sprite(texture);
          bgSprite.scale.x = targetScale;
          bgSprite.scale.y = targetScale;
          bgSprite.anchor.set(0.5);
          bgSprite.position.x = this.stageWidth / 2;
          bgSprite.position.y = this.stageHeight / 2;

          // 挂载
          this.backgroundObjects.push({ key: key, pixiSprite: bgSprite, url: url });
          this.backgroundContainer.addChild(bgSprite);
          resolve(true);
        } else resolve(false);
      };

      /**
       * 加载器部分
       */
      const resourses = Object.keys(loader.resources);
      if (!resourses.includes(url)) {
        // 此资源未加载，加载
        loader.add(url).load(setup);
      } else {
        // 复用
        setup();
      }
    });
  }

  public getBgByKey(key: string) {
    return this.backgroundObjects.find((e) => e.key === key);
  }

  public removeBg(key: string) {
    const index = this.backgroundObjects.findIndex((e) => e.key === key);
    if (index >= 0) {
      const bgSprite = this.backgroundObjects[index];
      bgSprite.pixiSprite.destroy();
      this.backgroundContainer.removeChild(bgSprite.pixiSprite);
      this.backgroundObjects.splice(index, 1);
    }
  }

  public addFigure(key: string, url: string, presetPosition: 'left' | 'center' | 'right' = 'center') {
    return new Promise<boolean>((resolve) => {
      const loader = new PIXI.Loader();

      // 完成图片加载后执行的函数
      const setup = () => {
        const texture = loader.resources[url].texture;
        const isSetThisFigure = this.figureObjects.findIndex((e) => e.key === key) >= 0;
        if (texture && !isSetThisFigure) {
          /**
           * 重设大小
           */
          const originalWidth = texture.width;
          const originalHeight = texture.height;
          const scaleX = this.stageWidth / originalWidth;
          const scaleY = this.stageHeight / originalHeight;
          const targetScale = Math.min(scaleX, scaleY);
          const figureSprite = new PIXI.Sprite(texture);
          figureSprite.scale.x = targetScale;
          figureSprite.scale.y = targetScale;
          figureSprite.anchor.set(0.5);
          figureSprite.position.y = this.stageHeight / 2;
          const targetWidth = originalWidth * targetScale;
          if (presetPosition === 'center') {
            figureSprite.position.x = this.stageWidth / 2;
          }
          if (presetPosition === 'left') {
            figureSprite.position.x = targetWidth / 2;
          }
          if (presetPosition === 'right') {
            figureSprite.position.x = this.stageWidth - targetWidth / 2;
          }

          // 挂载
          this.figureObjects.push({ key: key, pixiSprite: figureSprite, url: url });
          this.figureContainer.addChild(figureSprite);
          resolve(true);
        } else resolve(false);
      };

      /**
       * 加载器部分
       */
      const resourses = Object.keys(loader.resources);
      if (!resourses.includes(url)) {
        // 此资源未加载，加载
        loader.add(url).load(setup);
      } else {
        // 复用
        setup();
      }
    });
  }

  public getFigureByKey(key: string) {
    return this.figureObjects.find((e) => e.key === key);
  }

  public removeFigure(key: string) {
    const index = this.figureObjects.findIndex((e) => e.key === key);
    if (index >= 0) {
      const bgSprite = this.figureObjects[index];
      bgSprite.pixiSprite.destroy();
      this.figureContainer.removeChild(bgSprite.pixiSprite);
      this.figureObjects.splice(index, 1);
    }
  }
}
