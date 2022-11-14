import * as PIXI from 'pixi.js';
import { v4 as uuid } from 'uuid';

interface ITickerFunc {
  // 唯一标识
  uuid: string;
  // 一般与作用目标有关
  key: string;
  targetKey?: string;
  func: PIXI.TickerCallback<number>;
}

export interface IStageObject {
  // 唯一标识
  uuid: string;
  // 一般与作用目标有关
  key: string;
  pixiContainer: PIXI.Container;
  // 相关的源 url
  sourceUrl: string;
}

export interface IRegisterTickerOpr {
  tickerGeneratorFn: (targetKey: string, duration: number) => PIXI.TickerCallback<number>;
  key: string;
  target: string;
  duration: number;
}

export default class PixiStage {
  /**
   * 当前的 PIXI App
   */
  public currentApp: PIXI.Application | null = null;
  public effectsContainer: PIXI.Container;
  public figureContainer: PIXI.Container;
  public figureObjects: Array<IStageObject> = [];
  public backgroundContainer: PIXI.Container;
  public backgroundObjects: Array<IStageObject> = [];
  public frameDuration = PIXI.Ticker.shared.elapsedMS;

  // 注册到 Ticker 上的函数
  public tickerFuncs: Array<ITickerFunc> = [];

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

  public registerTicker(tickerFn: PIXI.TickerCallback<number>, key: string, target = 'default') {
    this.tickerFuncs.push({ uuid: uuid(), func: tickerFn, key: key, targetKey: target });
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

  /**
   * 添加背景
   * @param key 背景的标识，一般和背景类型有关
   * @param url 背景图片url
   */
  public addBg(key: string, url: string) {
    return new Promise<boolean>((resolve) => {
      const loader = new PIXI.Loader();

      // 准备用于存放这个背景的 Container
      const thisBgContainer = new PIXI.Container();

      // 是否有相同 key 的背景
      const setBgIndex = this.backgroundObjects.findIndex((e) => e.key === key);
      const isBgSet = setBgIndex >= 0;

      // 已经有一个这个 key 的背景存在了
      if (isBgSet) {
        // 挤占
        this.removeStageObjectByKey(key);
      }

      // 挂载
      this.backgroundContainer.addChild(thisBgContainer);
      this.backgroundObjects.push({ uuid: uuid(), key: key, pixiContainer: thisBgContainer, sourceUrl: url });
      resolve(true);

      // 完成图片加载后执行的函数
      const setup = () => {
        const texture = loader.resources[url].texture;
        if (texture && thisBgContainer) {
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
          thisBgContainer.addChild(bgSprite);
        }
      };

      /**
       * 加载器部分
       */
      const resourses = Object.keys(loader.resources);
      if (!resourses.includes(url)) {
        // 清缓存
        PIXI.utils.clearTextureCache();
        // 此资源未加载，加载
        loader.add(url).load(setup);
      } else {
        // 复用
        setup();
      }
    });
  }

  public addFigure(key: string, url: string, presetPosition: 'left' | 'center' | 'right' = 'center') {
    return new Promise<boolean>((resolve) => {
      const loader = new PIXI.Loader();

      // 准备用于存放这个立绘的 Container
      const thisFigureContainer = new PIXI.Container();

      // 是否有相同 key 的立绘
      const setFigIndex = this.figureObjects.findIndex((e) => e.key === key);
      const isFigSet = setFigIndex >= 0;

      // 已经有一个这个 key 的立绘存在了
      if (isFigSet) {
        // 挤占
        this.removeStageObjectByKey(key);
      }

      // 挂载
      this.figureContainer.addChild(thisFigureContainer);
      this.figureObjects.push({ uuid: uuid(), key: key, pixiContainer: thisFigureContainer, sourceUrl: url });
      resolve(true);

      // 完成图片加载后执行的函数
      const setup = () => {
        const texture = loader.resources[url].texture;
        if (texture && thisFigureContainer) {
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
          thisFigureContainer.addChild(figureSprite);
        }
      };

      /**
       * 加载器部分
       */
      const resourses = Object.keys(loader.resources);
      if (!resourses.includes(url)) {
        // 清缓存
        PIXI.utils.clearTextureCache();
        // 此资源未加载，加载
        loader.add(url).load(setup);
      } else {
        // 复用
        setup();
      }
    });
  }

  public getStageObjByKey(key: string) {
    return [...this.figureObjects, ...this.backgroundObjects].find((e) => e.key === key);
  }

  public removeStageObjectByKey(key: string) {
    const indexFig = this.figureObjects.findIndex((e) => e.key === key);
    const indexBg = this.backgroundObjects.findIndex((e) => e.key === key);
    if (indexFig >= 0) {
      const bgSprite = this.figureObjects[indexFig];
      bgSprite.pixiContainer.destroy();
      this.figureContainer.removeChild(bgSprite.pixiContainer);
      this.figureObjects.splice(indexFig, 1);
    }
    if (indexBg >= 0) {
      const bgSprite = this.backgroundObjects[indexBg];
      bgSprite.pixiContainer.destroy();
      this.backgroundContainer.removeChild(bgSprite.pixiContainer);
      this.backgroundObjects.splice(indexBg, 1);
    }
  }
}
