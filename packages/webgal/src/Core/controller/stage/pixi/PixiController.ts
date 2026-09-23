import {
  getFigureBaseX,
  IFigureAssociatedAnimation,
  IFigureMetadata,
  IFigurePosition,
  ITransform,
} from '@/Core/Modules/stage/stageInterface';
import { Live2D } from '@/Core/WebGAL';
import { baseBlinkParam, baseFocusParam, BlinkParam, FocusParam } from '@/Core/live2DCore';
import { isIOS } from '@/Core/initializeScript';
import { WebGALPixiContainer } from '@/Core/controller/stage/pixi/WebGALPixiContainer';
import { addSpineBgImpl, addSpineFigureImpl } from '@/Core/controller/stage/pixi/spine';
import { SCREEN_CONSTANTS } from '@/Core/util/constants';
import { logger } from '@/Core/util/logger';
import { v4 as uuid } from 'uuid';
import { cloneDeep, isEqual } from 'lodash';
import * as PIXI from 'pixi.js';
import { INSTALLED } from 'pixi.js';
import { GifResource } from './GifResource';
import { figureCash } from '@/Core/gameScripts/vocal/conentsCash';
import { AssetManager } from './assets/AssetManager';
import { acquireVideoTexture } from './assets/videoTexture';
import { ResourceRequest } from './assets/resourceTypes';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { queryStageObjectReferenceBox, type QueryTargetReferenceBoxResult } from './referenceBox';
import { assignPixiTransform } from './stageEffectTransform';

export interface IAnimationObject {
  setStartState: Function;
  setEndState: Function;
  tickerFunc: PIXI.TickerCallback<number>;
  getEndStateEffect?: Function;
  forceStopWithoutSetEndState?: Function;
}

interface IStageAnimationObject {
  // 一般与作用目标有关
  key: string;
  targetKey?: string;
  animationObject: IAnimationObject;
}

export interface IStageObject {
  // 唯一标识
  uuid: string;
  // 一般与作用目标有关
  key: string;
  pixiContainer: WebGALPixiContainer | null;
  // 相关的源 url
  sourceUrl: string;
  sourceExt: string;
  sourceType: 'img' | 'live2d' | 'spine' | 'gif' | 'video' | 'stage';
  spineAnimation?: string;
  /** 创建这个立绘时用的身份，见 syncPixiStageState 的 getFigureIdentity */
  figureIdentity?: string;
  isExiting?: boolean;
  releaseInstance?: () => void;
  /** 口型、眨眼各自最新的换图请求，旧请求完成时据此丢弃 */
  textureRequests?: Partial<Record<'mouth' | 'blink', string>>;
  /** Sprite 当前显示的口型眨眼图地址；未设置时显示的是 sourceUrl */
  textureUrl?: string;
  /** 差分混合进行中，口型眨眼暂不换图 */
  isDiffBlending?: boolean;
}

export interface ILive2DRecord {
  target: string;
  motion: string;
  expression: string;
  blink: BlinkParam;
  focus: FocusParam;
}

// export interface IRegisterTickerOpr {
//   tickerGeneratorFn: (targetKey: string, duration: number) => PIXI.TickerCallback<number>;
//   key: string;
//   target: string;
//   duration: number;
// }

// @ts-ignore
window.PIXI = PIXI;

INSTALLED.push(GifResource);

export default class PixiStage {
  public static assignTransform<T extends ITransform>(target: T, source?: ITransform, convertAlpha = true) {
    assignPixiTransform(target, source, convertAlpha);
  }

  /**
   * 当前的 PIXI App
   */
  public currentApp: PIXI.Application | null = null;
  public readonly mainStageContainer: WebGALPixiContainer;
  public readonly foregroundEffectsContainer: PIXI.Container;
  public readonly backgroundEffectsContainer: PIXI.Container;
  public readonly figureContainer: PIXI.Container;
  public figureObjects = this.createReactiveList<IStageObject>([]);
  public stageWidth = SCREEN_CONSTANTS.width;
  public stageHeight = SCREEN_CONSTANTS.height;
  public readonly assets = new AssetManager();
  public readonly backgroundContainer: PIXI.Container;
  public backgroundObjects = this.createReactiveList<IStageObject>([]);
  public mainStageObject: IStageObject;
  /**
   * 添加 Spine 立绘
   * @param key 立绘的标识，一般和立绘位置有关
   * @param url 立绘图片url
   * @param presetPosition
   */
  public addSpineFigure = addSpineFigureImpl.bind(this);
  public addSpineBg = addSpineBgImpl.bind(this);
  // 注册到 Ticker 上的函数
  private stageAnimations = this.createReactiveList<IStageAnimationObject>([]);

  private live2dFigureRecorder: Array<ILive2DRecord> = [];
  // 锁定变换对象（对象可能正在执行动画，不能应用变换）
  private lockTransformTarget: Array<string> = [];
  // 手动请求渲染防抖标记
  private isRenderPending = false;
  // 更新 ticker 状态的防抖标记
  private isTickerUpdatePending = false;
  private referenceBoxWaiters = new Map<string, Set<() => void>>();

  /**
   * 暂时没用上，以后可能用
   * @private
   */
  private MAX_TEX_COUNT = 10;

  public constructor() {
    const app = new PIXI.Application({
      backgroundAlpha: 0,
      preserveDrawingBuffer: true,
      autoStart: false,
    });
    // @ts-ignore

    window.PIXIapp = this; // @ts-ignore
    window.__PIXI_APP__ = app;
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
    if (isIOS) {
      app.renderer.view.style.zIndex = '-5';
    }

    // 添加主舞台容器
    this.mainStageContainer = new WebGALPixiContainer();
    // 设置可排序
    this.mainStageContainer.sortableChildren = true;
    this.mainStageContainer.setBaseX(this.stageWidth / 2);
    this.mainStageContainer.setBaseY(this.stageHeight / 2);
    this.mainStageContainer.pivot.set(this.stageWidth / 2, this.stageHeight / 2);
    app.stage.addChild(this.mainStageContainer);

    this.mainStageObject = {
      uuid: uuid(),
      key: 'stage-main',
      pixiContainer: this.mainStageContainer,
      sourceUrl: '',
      sourceType: 'stage',
      sourceExt: '',
    };

    // 添加 4 个 Container 用于做渲染
    this.foregroundEffectsContainer = new PIXI.Container(); // 前景特效
    this.foregroundEffectsContainer.zIndex = 3;
    this.figureContainer = new PIXI.Container();
    this.figureContainer.sortableChildren = true; // 允许立绘启用 z-index
    this.figureContainer.zIndex = 2;
    this.backgroundEffectsContainer = new PIXI.Container(); // 背景特效
    this.backgroundEffectsContainer.zIndex = 1;
    this.backgroundContainer = new PIXI.Container();
    this.backgroundContainer.zIndex = 0;
    this.mainStageContainer.addChild(
      this.foregroundEffectsContainer,
      this.figureContainer,
      this.backgroundEffectsContainer,
      this.backgroundContainer,
    );
    this.currentApp = app;
    if (app.renderer instanceof PIXI.Renderer) this.assets.attach(app.renderer);
    this.requestRender();
  }

  public requestRender() {
    if (this.isRenderPending) return;
    this.isRenderPending = true;

    requestAnimationFrame(() => {
      this.isRenderPending = false;
      if (!this.currentApp?.ticker.started) {
        this.currentApp?.render();
      }
    });
  }

  public getFigureObjects() {
    return this.figureObjects;
  }

  public getAllLockedObject() {
    return this.lockTransformTarget;
  }

  /**
   * 注册动画
   * @param animationObject
   * @param key
   * @param target
   */
  public registerAnimation(animationObject: IAnimationObject | null, key: string, target = 'default') {
    if (!animationObject) return;
    this.stageAnimations.push({ animationObject, key: key, targetKey: target });
    // 上锁
    this.lockStageObject(target);
    animationObject.setStartState();
    this.currentApp?.ticker.add(animationObject.tickerFunc);
  }

  /**
   * 移除动画
   * @param key
   */
  public removeAnimationByIndex(index: number) {
    if (index >= 0) {
      const thisTickerFunc = this.stageAnimations[index];
      this.currentApp?.ticker.remove(thisTickerFunc.animationObject.tickerFunc);
      thisTickerFunc.animationObject.setEndState();
      this.unlockStageObject(thisTickerFunc.targetKey ?? 'default');
      this.stageAnimations.splice(index, 1);
    }
  }

  public removeAnimationWithoutSetEndState(key: string) {
    const index = this.stageAnimations.findIndex((e) => e.key === key);
    if (index >= 0) {
      const thisTickerFunc = this.stageAnimations[index];
      this.currentApp?.ticker.remove(thisTickerFunc.animationObject.tickerFunc);
      if (thisTickerFunc.animationObject.forceStopWithoutSetEndState) {
        thisTickerFunc.animationObject.forceStopWithoutSetEndState();
      }
      this.unlockStageObject(thisTickerFunc.targetKey ?? 'default');
      this.stageAnimations.splice(index, 1);
    }
  }

  public removeAllAnimations() {
    while (this.stageAnimations.length > 0) {
      this.removeAnimationByIndex(0);
    }
  }

  public removeAnimation(key: string) {
    const index = this.stageAnimations.findIndex((e) => e.key === key);
    this.removeAnimationByIndex(index);
  }

  public hasAnimation(key: string): boolean {
    return this.stageAnimations.some((animation) => animation.key === key);
  }

  public removeAnimationByTargetKey(targetKey: string) {
    let index = this.stageAnimations.findIndex((e) => e.targetKey === targetKey);
    while (index !== -1) {
      this.removeAnimationByIndex(index);
      index = this.stageAnimations.findIndex((e) => e.targetKey === targetKey);
    }
  }

  // eslint-disable-next-line max-params
  public performMouthSyncAnimation(
    key: string,
    targetAnimation: IFigureAssociatedAnimation,
    mouthState: string,
    presetPosition: string,
  ) {
    const currentFigure = this.getStageObjByKey(key)?.pixiContainer as WebGALPixiContainer;

    if (!currentFigure) {
      return;
    }

    const mouthTextureUrls: any = {
      open: targetAnimation.mouthAnimation.open,
      half_open: targetAnimation.mouthAnimation.halfOpen,
      closed: targetAnimation.mouthAnimation.close,
    };

    this.swapFigureTexture(key, 'mouth', mouthTextureUrls[mouthState]);
  }

  // eslint-disable-next-line max-params
  public performBlinkAnimation(
    key: string,
    targetAnimation: IFigureAssociatedAnimation,
    blinkState: string,
    presetPosition: string,
  ) {
    const currentFigure = this.getStageObjByKey(key)?.pixiContainer as WebGALPixiContainer;

    if (!currentFigure) {
      return;
    }
    const blinkTextureUrls: any = {
      open: targetAnimation.blinkAnimation.open,
      closed: targetAnimation.blinkAnimation.close,
    };

    this.swapFigureTexture(key, 'blink', blinkTextureUrls[blinkState]);
  }

  /**
   * 口型与眨眼各自只采用本通道最新一次请求；空路径表示未配置该差分，不发起加载。
   * 差分优先：混合进行中不换图；语音等演出捕获的旧表情配置已被差分替换，同样丢弃。
   */
  private swapFigureTexture(key: string, channel: 'mouth' | 'blink', url: string) {
    const object = this.getStageObjByKey(key);
    if (!object || object.isDiffBlending || !url || url.endsWith('/')) return;
    if (!this.isCurrentAssociatedTexture(key, url)) return;
    const request = uuid();
    object.textureRequests = { ...object.textureRequests, [channel]: request };
    this.loadStageAsset(
      object.uuid,
      () => {
        if (object.textureRequests?.[channel] !== request || object.isDiffBlending) return;
        // 加载期间可能已换了差分，完成时再确认一次。
        if (!this.isCurrentAssociatedTexture(key, url)) return;
        const texture = this.assets.getReady<PIXI.Texture>({ url, kind: 'texture' });
        const sprite = object.pixiContainer?.children?.[0] as PIXI.Sprite | undefined;
        if (!texture || !sprite) return;
        sprite.texture = texture;
        object.textureUrl = url;
        this.requestRender();
      },
      { url, kind: 'texture' },
    );
  }

  /** 只接受已提交状态中该立绘当前的口型眨眼图 */
  private isCurrentAssociatedTexture(key: string, url: string) {
    const current = stageStateManager.getViewStageState().figureAssociatedAnimation.find((e) => e.targetId === key);
    return (
      !!current && [...Object.values(current.mouthAnimation), ...Object.values(current.blinkAnimation)].includes(url)
    );
  }

  /**
   * 添加背景
   * @param key 背景的标识，一般和背景类型有关
   * @param url 背景图片url
   */
  public addBg(key: string, url: string) {
    // 准备用于存放这个背景的 Container
    const thisBgContainer = new WebGALPixiContainer();

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
    const bgUuid = uuid();
    const sourceExt = this.getExtName(url);
    this.backgroundObjects.push({
      uuid: bgUuid,
      key: key,
      pixiContainer: thisBgContainer,
      sourceUrl: url,
      sourceType: sourceExt === 'gif' ? 'gif' : 'img',
      sourceExt,
    });

    // 完成图片加载后执行的函数
    const setup = () => {
      // 对象已同步入表，资源就绪后直接挂载；动画由 commit 后的演出启动。
      const texture = this.assets.getReady<PIXI.Texture>({ url, kind: 'texture' });
      if (texture && this.getStageObjByUuid(bgUuid)) {
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
        bgSprite.position.y = this.stageHeight / 2;
        thisBgContainer.setBaseX(this.stageWidth / 2);
        thisBgContainer.setBaseY(this.stageHeight / 2);
        thisBgContainer.pivot.set(0, this.stageHeight / 2);

        // 挂载
        thisBgContainer.addChild(bgSprite);
        if (texture.baseTexture.resource instanceof GifResource) texture.baseTexture.resource.play();
        this.notifyTargetReferenceBoxChanged(key);
        this.requestRender();
      }
    };

    /**
     * 加载器部分
     */
    this.loadStageAsset(bgUuid, setup);
  }

  /**
   * 添加视频背景
   * @param key 背景的标识，一般和背景类型有关
   * @param url 背景图片url
   */
  public addVideoBg(key: string, url: string) {
    // 准备用于存放这个背景的 Container
    const thisBgContainer = new WebGALPixiContainer();

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
    const bgUuid = uuid();
    this.backgroundObjects.push({
      uuid: bgUuid,
      key: key,
      pixiContainer: thisBgContainer,
      sourceUrl: url,
      sourceType: 'video',
      sourceExt: this.getExtName(url),
    });

    const setup = () => {
      const prepared = this.assets.getReady<PIXI.Texture>({ url, kind: 'texture' });
      if (!prepared) return;
      return acquireVideoTexture(prepared, url)
        .then(async ({ texture, video, release }) => {
          const object = this.getStageObjByUuid(bgUuid);
          if (!object) {
            release();
            return;
          }
          object.releaseInstance = release;
          await this.assets.prepare([texture]);
          if (!this.getStageObjByUuid(bgUuid)) return;
          const originalWidth = video.videoWidth;
          const originalHeight = video.videoHeight;
          const scaleX = this.stageWidth / originalWidth;
          const scaleY = this.stageHeight / originalHeight;
          const targetScale = Math.max(scaleX, scaleY);
          const bgSprite = new PIXI.Sprite(texture);
          bgSprite.scale.x = targetScale;
          bgSprite.scale.y = targetScale;
          bgSprite.anchor.set(0.5);
          bgSprite.position.y = this.stageHeight / 2;
          thisBgContainer.setBaseX(this.stageWidth / 2);
          thisBgContainer.setBaseY(this.stageHeight / 2);
          thisBgContainer.pivot.set(0, this.stageHeight / 2);
          thisBgContainer.addChild(bgSprite);
          void video.play().catch((error) => logger.warn('视频背景播放失败', error));
          this.notifyTargetReferenceBoxChanged(key);
          this.requestRender();
        })
        .catch((error) => logger.warn(`视频背景加载失败：${url}`, error));
    };

    /**
     * 加载器部分
     */
    this.loadStageAsset(bgUuid, setup);
  }

  /**
   * 添加立绘
   * @param key 立绘的标识，一般和立绘位置有关
   * @param url 立绘图片url
   * @param presetPosition
   */
  public addFigure(key: string, url: string, presetPosition: IFigurePosition = 'center') {
    // 准备用于存放这个立绘的 Container
    const thisFigureContainer = new WebGALPixiContainer();

    // 是否有相同 key 的立绘
    const setFigIndex = this.figureObjects.findIndex((e) => e.key === key);
    const isFigSet = setFigIndex >= 0;

    // 已经有一个这个 key 的立绘存在了
    if (isFigSet) {
      this.removeStageObjectByKey(key);
    }

    const metadata = this.getFigureMetadataByKey(key);
    if (metadata) {
      if (metadata.zIndex) {
        thisFigureContainer.zIndex = metadata.zIndex;
      }
      if (metadata.blendMode) {
        thisFigureContainer.blendMode = metadata.blendMode;
      }
    }
    // 挂载
    this.figureContainer.addChild(thisFigureContainer);
    const figureUuid = uuid();
    const sourceExt = this.getExtName(url);
    this.figureObjects.push({
      uuid: figureUuid,
      key: key,
      pixiContainer: thisFigureContainer,
      sourceUrl: url,
      sourceType: sourceExt === 'gif' ? 'gif' : 'img',
      sourceExt,
    });
    // 完成图片加载后执行的函数
    const setup = () => {
      // 对象已同步入表，资源就绪后直接挂载；动画由 commit 后的演出启动。
      const texture = this.assets.getReady<PIXI.Texture>({ url, kind: 'texture' });
      if (texture && this.getStageObjByUuid(figureUuid)) {
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
        const targetHeight = originalHeight * targetScale;
        thisFigureContainer.setBaseY(this.stageHeight / 2);
        if (targetHeight < this.stageHeight) {
          thisFigureContainer.setBaseY(this.stageHeight / 2 + (this.stageHeight - targetHeight) / 2);
        }
        thisFigureContainer.setBaseX(getFigureBaseX(presetPosition, this.stageWidth, targetWidth));
        thisFigureContainer.pivot.set(0, this.stageHeight / 2);
        thisFigureContainer.addChild(figureSprite);
        if (texture.baseTexture.resource instanceof GifResource) texture.baseTexture.resource.play();
        this.notifyTargetReferenceBoxChanged(key);
        this.requestRender();
      }
    };

    /**
     * 加载器部分
     */
    this.loadStageAsset(figureUuid, setup);
  }

  /**
   * Live2d立绘，如果要使用 Live2D，取消这里的注释
   * @param jsonPath
   */
  // eslint-disable-next-line max-params
  public addLive2dFigure(key: string, jsonPath: string, pos: IFigurePosition) {
    try {
      let stageWidth = this.stageWidth;
      let stageHeight = this.stageHeight;

      figureCash.push(jsonPath);

      // 准备用于存放这个立绘的 Container
      const thisFigureContainer = new WebGALPixiContainer();

      // 是否有相同 key 的立绘
      const setFigIndex = this.figureObjects.findIndex((e) => e.key === key);
      const isFigSet = setFigIndex >= 0;

      // 已经有一个这个 key 的立绘存在了
      if (isFigSet) {
        this.removeStageObjectByKey(key);
      }

      const metadata = this.getFigureMetadataByKey(key);
      if (metadata) {
        if (metadata.zIndex) {
          thisFigureContainer.zIndex = metadata.zIndex;
        }
        if (metadata.blendMode) {
          thisFigureContainer.blendMode = metadata.blendMode;
        }
      }
      // 挂载
      this.figureContainer.addChild(thisFigureContainer);
      const figureUuid = uuid();
      this.figureObjects.push({
        uuid: figureUuid,
        key: key,
        pixiContainer: thisFigureContainer,
        sourceUrl: jsonPath,
        sourceType: 'live2d',
        sourceExt: 'json',
      });
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const instance = this;

      const setup = () => {
        if (thisFigureContainer && this.getStageObjByUuid(figureUuid)) {
          return (async function () {
            await Live2D.ready;
            if (!Live2D.isAvailable || !instance.getStageObjByUuid(figureUuid)) return;
            let overrideBounds: [number, number, number, number] = [0, 0, 0, 0];
            const mot = stageStateManager.getViewStageState().live2dMotion.find((e) => e.target === key);
            if (mot?.overrideBounds) {
              overrideBounds = mot.overrideBounds;
            }
            console.log(overrideBounds);
            const models = await Promise.all([
              Live2D.Live2DModel.from(jsonPath, {
                autoInteract: false,
                overWriteBounds: {
                  x0: overrideBounds[0],
                  y0: overrideBounds[1],
                  x1: overrideBounds[2],
                  y1: overrideBounds[3],
                },
              }),
            ]);

            models.forEach((model) => {
              if (!instance.getStageObjByUuid(figureUuid)) {
                model.destroy();
                return;
              }
              const scaleX = stageWidth / model.width;
              const scaleY = stageHeight / model.height;
              const targetScale = Math.min(scaleX, scaleY);
              const targetWidth = model.width * targetScale;
              const targetHeight = model.height * targetScale;
              model.scale.x = targetScale;
              model.scale.y = targetScale;
              model.anchor.set(0.5);
              model.pivot.x += (overrideBounds[0] + overrideBounds[2]) * 0.5;
              model.pivot.y += (overrideBounds[1] + overrideBounds[3]) * 0.5;
              model.position.x = 0;
              model.position.y = stageHeight / 2;

              let baseY = stageHeight / 2;
              if (targetHeight < stageHeight) {
                baseY = stageHeight / 2 + (stageHeight - targetHeight) / 2;
              }
              thisFigureContainer.setBaseY(baseY);
              thisFigureContainer.setBaseX(getFigureBaseX(pos, stageWidth, targetWidth));

              thisFigureContainer.pivot.set(0, stageHeight / 2);

              let animation_index = 0;
              let priority_number = 3;

              // motion
              let motionToSet = '';
              const motionFromState = stageStateManager.getViewStageState().live2dMotion.find((e) => e.target === key);
              if (motionFromState) {
                motionToSet = motionFromState.motion;
              }
              instance.updateL2dMotionByKey(key, motionToSet);
              model.motion(motionToSet, animation_index, priority_number);

              // expression
              let expressionToSet = '';
              const expressionFromState = stageStateManager
                .getViewStageState()
                .live2dExpression.find((e) => e.target === key);
              if (expressionFromState) {
                expressionToSet = expressionFromState.expression;
              }
              instance.updateL2dExpressionByKey(key, expressionToSet);
              model.expression(expressionToSet);

              // blink
              let blinkToSet: BlinkParam = baseBlinkParam;
              const blinkFromState = stageStateManager.getViewStageState().live2dBlink.find((e) => e.target === key);
              if (blinkFromState) {
                blinkToSet = { ...blinkToSet, ...blinkFromState.blink };
              }
              instance.updateL2dBlinkByKey(key, blinkToSet);
              model.internalModel?.setBlinkParam(blinkToSet);

              // focus
              let focusToSet: FocusParam = baseFocusParam;
              const focusFromState = stageStateManager.getViewStageState().live2dFocus.find((e) => e.target === key);
              if (focusFromState) {
                focusToSet = { ...focusToSet, ...focusFromState.focus };
              }
              instance.updateL2dFocusByKey(key, focusToSet);
              model.internalModel?.focusController?.focus(focusToSet.x, focusToSet.y, focusToSet.instant);

              // lip-sync is still a problem and you can not.
              Live2D.SoundManager.volume = 0; // @ts-ignore

              thisFigureContainer.addChild(model);
              instance.notifyTargetReferenceBoxChanged(key);
              instance.requestRender();
            });
          })().catch((error) => logger.warn(`Live2D 加载失败：${jsonPath}`, error));
        }
      };

      /**
       * 加载器部分
       */
      this.loadStageAsset(figureUuid, setup);
    } catch (error) {
      console.error('Live2d Module err: ' + error);
    }
  }

  public changeModelMotionByKey(key: string, motion: string) {
    // logger.debug(`Applying motion ${motion} to ${key}`);
    const target = this.figureObjects.find((e) => e.key === key && !e.isExiting);
    if (target?.sourceType === 'live2d') {
      const figureRecordTarget = this.live2dFigureRecorder.find((e) => e.target === key);
      if (target && figureRecordTarget?.motion !== motion) {
        const container = target.pixiContainer;
        if (!container) return;
        const children = container.children;
        for (const model of children) {
          let category_name = motion;
          let animation_index = 0;
          let priority_number = 3; // @ts-ignore
          const internalModel = model?.internalModel ?? undefined; // 安全访问
          internalModel?.motionManager?.stopAllMotions?.();
          // @ts-ignore
          model.motion(category_name, animation_index, priority_number);
        }
        this.updateL2dMotionByKey(key, motion);
      }
    } else if (target?.sourceType === 'spine') {
      // 处理 Spine 动画切换
      this.changeSpineAnimationByKey(key, motion);
    }
  }

  public changeSpineAnimationByKey(key: string, animation: string) {
    const target = this.figureObjects.find((e) => e.key === key && !e.isExiting);
    if (target?.sourceType !== 'spine') return;

    const container = target.pixiContainer;
    if (!container) return;
    // Spine figure 结构: Container -> Sprite -> Spine
    const sprite = container.children[0] as PIXI.Container;
    if (sprite?.children?.[0]) {
      const spineObject = sprite.children[0];
      // @ts-ignore
      if (spineObject.state && spineObject.spineData) {
        // @ts-ignore
        const animationExists = spineObject.spineData.animations.find((anim: any) => anim.name === animation);
        let targetCurrentAnimation = target?.spineAnimation ?? '';
        if (animationExists && targetCurrentAnimation !== animation) {
          console.log(`setting animation ${animation}`);
          target!.spineAnimation = animation;
          // @ts-ignore
          spineObject.state.setAnimation(0, animation, false);
        }
      }
    }
  }

  public changeSpineSkinByKey(key: string, skin: string) {
    if (!skin) return;

    const target = this.figureObjects.find((e) => e.key === key && !e.isExiting);
    if (target?.sourceType !== 'spine') return;

    const container = target.pixiContainer;
    if (!container) return;
    const sprite = container.children[0] as PIXI.Container;
    if (sprite?.children?.[0]) {
      const spineObject = sprite.children[0];
      // @ts-ignore
      const skeleton = spineObject.skeleton;
      // @ts-ignore
      const skeletonData = skeleton?.data ?? spineObject.spineData;
      const skinObject =
        // @ts-ignore
        skeletonData?.findSkin?.(skin) ??
        // @ts-ignore
        skeletonData?.skins?.find((item: any) => item.name === skin);

      if (!skeleton || !skinObject) {
        logger.warn(`Spine skin not found: ${skin} on ${key}`);
        return;
      }

      try {
        // @ts-ignore
        if (typeof skeleton.setSkinByName === 'function') {
          // @ts-ignore
          skeleton.setSkinByName(skin);
        } else {
          // @ts-ignore
          skeleton.setSkin(skinObject);
        }
      } catch (error) {
        // @ts-ignore
        skeleton.setSkin?.(skinObject);
      }

      // @ts-ignore
      if (typeof skeleton.setSlotsToSetupPose === 'function') {
        // @ts-ignore
        skeleton.setSlotsToSetupPose();
      } else {
        // @ts-ignore
        skeleton.setupPoseSlots?.();
      }

      // @ts-ignore
      spineObject.state?.apply?.(skeleton);
      // @ts-ignore
      skeleton.updateWorldTransform?.();
    }
  }

  public changeModelExpressionByKey(key: string, expression: string) {
    // logger.debug(`Applying expression ${expression} to ${key}`);
    const target = this.figureObjects.find((e) => e.key === key && !e.isExiting);
    if (target?.sourceType !== 'live2d') return;
    const figureRecordTarget = this.live2dFigureRecorder.find((e) => e.target === key);
    if (target && figureRecordTarget?.expression !== expression) {
      const container = target.pixiContainer;
      if (!container) return;
      const children = container.children;
      for (const model of children) {
        // @ts-ignore
        model.expression(expression);
      }
      this.updateL2dExpressionByKey(key, expression);
    }
  }

  public changeModelBlinkByKey(key: string, blinkParam: BlinkParam) {
    const target = this.figureObjects.find((e) => e.key === key && !e.isExiting);
    if (target?.sourceType !== 'live2d') return;
    const figureRecordTarget = this.live2dFigureRecorder.find((e) => e.target === key);
    if (target && !isEqual(figureRecordTarget?.blink, blinkParam)) {
      const container = target.pixiContainer;
      if (!container) return;
      const children = container.children;
      let newBlinkParam: BlinkParam = { ...baseBlinkParam, ...blinkParam };
      // 继承现有 BlinkParam
      if (figureRecordTarget?.blink) {
        newBlinkParam = { ...cloneDeep(figureRecordTarget.blink), ...blinkParam };
      }
      for (const model of children) {
        // @ts-ignore
        model?.internalModel?.setBlinkParam?.(newBlinkParam);
      }
      this.updateL2dBlinkByKey(key, newBlinkParam);
    }
  }

  public changeModelFocusByKey(key: string, focusParam: FocusParam) {
    const target = this.figureObjects.find((e) => e.key === key && !e.isExiting);
    if (target?.sourceType !== 'live2d') return;
    const figureRecordTarget = this.live2dFigureRecorder.find((e) => e.target === key);
    if (target && !isEqual(figureRecordTarget?.focus, focusParam)) {
      const container = target.pixiContainer;
      if (!container) return;
      const children = container.children;
      let newFocusParam: FocusParam = { ...baseFocusParam, ...focusParam };
      // 继承现有 FocusParam
      if (figureRecordTarget?.focus) {
        newFocusParam = { ...cloneDeep(figureRecordTarget.focus), ...focusParam };
      }
      for (const model of children) {
        // @ts-ignore
        model?.internalModel?.focusController.focus(newFocusParam.x, newFocusParam.y, newFocusParam.instant);
      }
      this.updateL2dFocusByKey(key, newFocusParam);
    }
  }

  public setModelMouthY(key: string, y: number) {
    function mapToZeroOne(value: number) {
      return value < 50 ? 0 : (value - 50) / 50;
    }

    const paramY = mapToZeroOne(y);
    const target = this.figureObjects.find((e) => e.key === key);
    if (target && target.sourceType === 'live2d') {
      const container = target.pixiContainer;
      if (!container) return;
      const children = container.children;
      for (const model of children) {
        // @ts-ignore
        if (model?.internalModel) {
          // @ts-ignore
          if (model?.internalModel?.coreModel?.setParamFloat)
            // @ts-ignore
            model?.internalModel?.coreModel?.setParamFloat?.('PARAM_MOUTH_OPEN_Y', paramY);
          // @ts-ignore
          if (model?.internalModel?.coreModel?.setParameterValueById)
            // @ts-ignore
            model?.internalModel?.coreModel?.setParameterValueById('ParamMouthOpenY', paramY);
        }
      }
    }
  }

  /**
   * 根据 key 获取舞台上的对象
   * @param key
   */
  public getStageObjByKey(key: string) {
    return [...this.figureObjects, ...this.backgroundObjects, this.mainStageObject].find((e) => e.key === key);
  }

  public queryTargetReferenceBox(target: string): QueryTargetReferenceBoxResult {
    return queryStageObjectReferenceBox(target, this.getStageObjByKey(target), {
      width: this.stageWidth,
      height: this.stageHeight,
    });
  }

  public waitForTargetReferenceBox(target: string, timeoutMs: number): Promise<void> {
    return new Promise((resolve) => {
      const existingWaiters = this.referenceBoxWaiters.get(target);
      const waiters = existingWaiters ?? new Set<() => void>();
      if (!existingWaiters) {
        this.referenceBoxWaiters.set(target, waiters);
      }

      let timeoutId = 0;
      const resolveAndCleanup = () => {
        window.clearTimeout(timeoutId);
        waiters.delete(resolveAndCleanup);
        if (waiters.size === 0) {
          this.referenceBoxWaiters.delete(target);
        }
        resolve();
      };

      // 资源加载失败或尺寸通知缺失时也要结束等待，避免参考尺寸查询永久挂起。
      timeoutId = window.setTimeout(resolveAndCleanup, timeoutMs);
      waiters.add(resolveAndCleanup);
    });
  }

  public getStageObjByUuid(objUuid: string) {
    return [...this.figureObjects, ...this.backgroundObjects, this.mainStageObject].find((e) => e.uuid === objUuid);
  }

  public getAllStageObj() {
    return [...this.figureObjects, ...this.backgroundObjects, this.mainStageObject];
  }

  /**
   * 根据 key 删除舞台上的对象
   * @param key
   */
  public removeStageObjectByKey(key: string) {
    const indexFig = this.figureObjects.findIndex((e) => e.key === key);
    const indexBg = this.backgroundObjects.findIndex((e) => e.key === key);
    if (indexFig >= 0) {
      const bgSprite = this.figureObjects[indexFig];
      if (bgSprite.pixiContainer)
        for (const element of bgSprite.pixiContainer.children) {
          element.destroy({ children: true });
        }
      if (bgSprite.pixiContainer) {
        bgSprite.pixiContainer.destroy();
        this.figureContainer.removeChild(bgSprite.pixiContainer);
      }
      bgSprite.releaseInstance?.();
      this.assets.release(bgSprite.uuid);
      bgSprite.pixiContainer = null;
      this.figureObjects.splice(indexFig, 1);
      this.notifyTargetReferenceBoxChanged(key);
    }
    if (indexBg >= 0) {
      const bgSprite = this.backgroundObjects[indexBg];
      if (bgSprite.pixiContainer)
        for (const element of bgSprite.pixiContainer.children) {
          element.destroy({ children: true });
        }
      if (bgSprite.pixiContainer) {
        bgSprite.pixiContainer.destroy();
        this.backgroundContainer.removeChild(bgSprite.pixiContainer);
      }
      bgSprite.releaseInstance?.();
      this.assets.release(bgSprite.uuid);
      bgSprite.pixiContainer = null;
      this.backgroundObjects.splice(indexBg, 1);
      this.notifyTargetReferenceBoxChanged(key);
    }
    // /**
    //  * 删掉相关 Effects，因为已经移除了
    //  */
    // const prevEffects = stageStateManager.getViewStageState().effects;
    // const newEffects = __.cloneDeep(prevEffects);
    // const index = newEffects.findIndex((e) => e.target === key);
    // if (index >= 0) {
    //   newEffects.splice(index, 1);
    // }
    // updateCurrentEffects(newEffects);
  }

  public getExtName(url: string) {
    return (url.split(/[?#]/)[0].split('.').pop() ?? 'png').toLowerCase();
  }

  public getFigureMetadataByKey(key: string): IFigureMetadata | undefined {
    return stageStateManager.getViewStageState().figureMetaData[key];
  }

  public loadStageAsset(stageUuid: string, setup: () => void | Promise<void>, request?: ResourceRequest) {
    const object = this.getStageObjByUuid(stageUuid);
    if (!object) return;
    request ??= {
      url: object.sourceUrl,
      kind: object.sourceType === 'live2d' || object.sourceType === 'spine' ? object.sourceType : 'texture',
    };
    this.assets.retain(stageUuid, request);
    // 模型实例初始化尚未结束时，即使舞台对象退场，也不能销毁 SDK 正在使用的纹理。
    const pendingOwner = `${stageUuid}:pending:${uuid()}`;
    this.assets.retain(pendingOwner, request);
    const mount = () => (this.getStageObjByUuid(stageUuid) ? setup() : undefined);
    try {
      const operation =
        this.assets.getReady(request) !== undefined
          ? Promise.resolve(mount())
          : this.assets
              .ensureReady(request)
              .catch(() => this.assets.ensureReady(request!))
              .then(mount);
      void operation
        .catch((error) => logger.warn(`舞台资源加载失败：${request!.url}`, error))
        .finally(() => this.assets.release(pendingOwner));
    } catch (error) {
      this.assets.release(pendingOwner);
      logger.warn(`舞台资源挂载失败：${request.url}`, error);
    }
  }

  private updateL2dMotionByKey(target: string, motion: string) {
    const figureTargetIndex = this.live2dFigureRecorder.findIndex((e) => e.target === target);
    if (figureTargetIndex >= 0) {
      this.live2dFigureRecorder[figureTargetIndex].motion = motion;
    } else {
      this.live2dFigureRecorder.push({ target, motion, expression: '', blink: baseBlinkParam, focus: baseFocusParam });
    }
  }

  private updateL2dExpressionByKey(target: string, expression: string) {
    const figureTargetIndex = this.live2dFigureRecorder.findIndex((e) => e.target === target);
    if (figureTargetIndex >= 0) {
      this.live2dFigureRecorder[figureTargetIndex].expression = expression;
    } else {
      this.live2dFigureRecorder.push({ target, motion: '', expression, blink: baseBlinkParam, focus: baseFocusParam });
    }
  }

  private updateL2dBlinkByKey(target: string, blink: BlinkParam) {
    const figureTargetIndex = this.live2dFigureRecorder.findIndex((e) => e.target === target);
    if (figureTargetIndex >= 0) {
      this.live2dFigureRecorder[figureTargetIndex].blink = blink;
    } else {
      this.live2dFigureRecorder.push({ target, motion: '', expression: '', blink, focus: baseFocusParam });
    }
  }

  private updateL2dFocusByKey(target: string, focus: FocusParam) {
    const figureTargetIndex = this.live2dFigureRecorder.findIndex((e) => e.target === target);
    if (figureTargetIndex >= 0) {
      this.live2dFigureRecorder[figureTargetIndex].focus = focus;
    } else {
      this.live2dFigureRecorder.push({ target, motion: '', expression: '', blink: baseBlinkParam, focus });
    }
  }

  public notifyTargetReferenceBoxChanged(target: string): void {
    const waiters = this.referenceBoxWaiters.get(target);
    if (!waiters) {
      return;
    }

    for (const resolve of [...waiters]) {
      resolve();
    }
  }

  private lockStageObject(targetName: string) {
    this.lockTransformTarget.push(targetName);
  }

  private unlockStageObject(targetName: string) {
    const index = this.lockTransformTarget.findIndex((name) => name === targetName);
    if (index >= 0) this.lockTransformTarget.splice(index, 1);
  }

  private createReactiveList<T extends object>(array: T[]): T[] {
    return new Proxy(array, {
      // eslint-disable-next-line max-params
      set: (target, property, value, receiver) => {
        const result = Reflect.set(target, property, value, receiver);
        this.updateTickerStatus();
        return result;
      },
      deleteProperty: (target, property) => {
        const result = Reflect.deleteProperty(target, property);
        this.updateTickerStatus();
        return result;
      },
    });
  }

  private updateTickerStatus() {
    if (this.isTickerUpdatePending) return;
    this.isTickerUpdatePending = true;

    Promise.resolve().then(() => {
      this.isTickerUpdatePending = false;
      const app = this.currentApp;
      if (!app) return;

      const hasActiveAnimations = this.stageAnimations.length > 0;
      const allObjects = [...this.figureObjects, ...this.backgroundObjects];
      const hasDynamicObjects = allObjects.some(
        (obj) =>
          obj.sourceType === 'live2d' ||
          obj.sourceType === 'spine' ||
          obj.sourceType === 'video' ||
          obj.sourceType === 'gif',
      );

      const shouldRun = hasActiveAnimations || hasDynamicObjects;

      if (shouldRun) {
        if (!app.ticker.started) {
          app.ticker.start();
          logger.debug('Ticker: STARTED');
        }
      } else {
        if (app.ticker.started) {
          app.ticker.stop();
          this.currentApp?.render();
          logger.debug('Ticker: STOPPED');
        } else {
          this.requestRender();
        }
      }
    });
  }
}
