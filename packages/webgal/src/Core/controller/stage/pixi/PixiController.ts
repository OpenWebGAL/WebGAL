import * as PIXI from 'pixi.js';
import { v4 as uuid } from 'uuid';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import cloneDeep from 'lodash/cloneDeep';
import { IEffect } from '@/store/stageInterface';
import { logger } from '@/Core/util/etc/logger';
import { isIOS } from '@/Core/initializeScript';
import { WebGALPixiContainer } from '@/Core/controller/stage/pixi/WebGALPixiContainer';
// import { Live2DModel, SoundManager } from 'pixi-live2d-display';
import { figureCash, voiceCash } from '@/Core/gameScripts/function/conentsCash';

export interface IAnimationObject {
  setStartState: Function;
  setEndState: Function;
  tickerFunc: PIXI.TickerCallback<number>;
  getEndFilterEffect?: Function;
}

interface IStageAnimationObject {
  // 唯一标识
  uuid: string;
  // 一般与作用目标有关
  key: string;
  targetKey?: string;
  type: 'common' | 'preset';
  animationObject: IAnimationObject;
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

// export interface IRegisterTickerOpr {
//   tickerGeneratorFn: (targetKey: string, duration: number) => PIXI.TickerCallback<number>;
//   key: string;
//   target: string;
//   duration: number;
// }

// @ts-ignore
window.PIXI = PIXI;

export default class PixiStage {
  /**
   * 当前的 PIXI App
   */
  public currentApp: PIXI.Application | null = null;
  public readonly effectsContainer: PIXI.Container;
  public frameDuration = 16.67;
  private readonly figureContainer: PIXI.Container;
  private figureObjects: Array<IStageObject> = [];
  private readonly backgroundContainer: PIXI.Container;
  private backgroundObjects: Array<IStageObject> = [];

  // 注册到 Ticker 上的函数
  private stageAnimations: Array<IStageAnimationObject> = [];
  private assetLoader = new PIXI.Loader();
  private loadQueue: { url: string; callback: () => void }[] = [];

  // 锁定变换对象（对象可能正在执行动画，不能应用变换）
  private lockTransformTarget: Array<string> = [];
  private stageWidth = 2560;
  private stageHeight = 1440;
  /**
   * 暂时没用上，以后可能用
   * @private
   */
  private MAX_TEX_COUNT = 10;

  public constructor() {
    const app = new PIXI.Application({
      backgroundAlpha: 0,
      preserveDrawingBuffer: true,
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
    // 每 5s 获取帧率
    const update = () => {
      this.updateFps();
      setTimeout(update, 5000);
    };
    update();
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
    this.stageAnimations.push({ uuid: uuid(), animationObject, key: key, targetKey: target, type: 'common' });
    // 上锁
    this.lockStageObject(target);
    animationObject.setStartState();
    this.currentApp?.ticker.add(animationObject.tickerFunc);
  }

  /**
   * 注册预设动画
   * @param animationObject
   * @param key
   * @param target
   * @param currentEffects
   */
  // eslint-disable-next-line max-params
  public registerPresetAnimation(
    animationObject: IAnimationObject | null,
    key: string,
    target = 'default',
    currentEffects: IEffect[],
  ) {
    if (!animationObject) return;
    const effect = currentEffects.find((effect) => effect.target === target);
    if (effect) {
      const targetPixiContainer = this.getStageObjByKey(target);
      if (targetPixiContainer) {
        const container = targetPixiContainer.pixiContainer;
        Object.assign(container, effect.transform);
      }
      return;
    }
    this.stageAnimations.push({ uuid: uuid(), animationObject, key: key, targetKey: target, type: 'preset' });
    // 上锁
    this.lockStageObject(target);
    animationObject.setStartState();
    this.currentApp?.ticker.add(animationObject.tickerFunc);
  }

  public stopPresetAnimationOnTarget(target: string) {
    const targetPresetAnimations = this.stageAnimations.find((e) => e.targetKey === target && e.type === 'preset');
    if (targetPresetAnimations) {
      this.removeAnimation(targetPresetAnimations.key);
    }
  }

  /**
   * 移除动画
   * @param key
   */
  public removeAnimation(key: string) {
    const index = this.stageAnimations.findIndex((e) => e.key === key);
    if (index >= 0) {
      const thisTickerFunc = this.stageAnimations[index];
      this.currentApp?.ticker.remove(thisTickerFunc.animationObject.tickerFunc);
      thisTickerFunc.animationObject.setEndState();
      this.unlockStageObject(thisTickerFunc.targetKey ?? 'default');
      this.stageAnimations.splice(index, 1);
    }
  }

  public removeAnimationWithSetEffects(key: string) {
    const index = this.stageAnimations.findIndex((e) => e.key === key);
    if (index >= 0) {
      const thisTickerFunc = this.stageAnimations[index];
      this.currentApp?.ticker.remove(thisTickerFunc.animationObject.tickerFunc);
      thisTickerFunc.animationObject.setEndState();
      const webgalFilters = thisTickerFunc.animationObject.getEndFilterEffect?.() ?? {};
      this.unlockStageObject(thisTickerFunc.targetKey ?? 'default');
      if (thisTickerFunc.targetKey) {
        const target = this.getStageObjByKey(thisTickerFunc.targetKey);
        if (target) {
          const targetTransform = {
            alpha: target.pixiContainer.alpha,
            scale: {
              x: target.pixiContainer.scale.x,
              y: target.pixiContainer.scale.y,
            },
            pivot: {
              x: target.pixiContainer.pivot.x,
              y: target.pixiContainer.pivot.y,
            },
            position: {
              x: target.pixiContainer.x,
              y: target.pixiContainer.y,
            },
            rotation: target.pixiContainer.rotation,
            // @ts-ignore
            blur: target.pixiContainer.blur,
            ...webgalFilters,
          };
          const prevEffects = webgalStore.getState().stage.effects;
          const newEffects = cloneDeep(prevEffects);
          let effect: IEffect = { target: thisTickerFunc.targetKey, transform: targetTransform };
          const index = newEffects.findIndex((e) => e.target === thisTickerFunc.targetKey);
          if (index >= 0) {
            effect = newEffects[index];
            effect.transform = targetTransform;
            newEffects[index] = effect;
          } else {
            newEffects.push(effect);
          }
          updateCurrentEffects(newEffects);
        }
      }
      this.stageAnimations.splice(index, 1);
    }
  }

  /**
   * 添加背景
   * @param key 背景的标识，一般和背景类型有关
   * @param url 背景图片url
   */
  public addBg(key: string, url: string) {
    // const loader = this.assetLoader;
    const loader = this.assetLoader;
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
    this.backgroundObjects.push({ uuid: bgUuid, key: key, pixiContainer: thisBgContainer, sourceUrl: url });

    // 完成图片加载后执行的函数
    const setup = () => {
      const texture = loader.resources?.[url]?.texture;
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
      }
    };

    /**
     * 加载器部分
     */
    const resourses = Object.keys(loader.resources);
    this.cacheGC();
    if (!resourses.includes(url)) {
      this.loadAsset(url, setup);
    } else {
      // 复用
      setup();
    }
  }

  /**
   * 添加立绘
   * @param key 立绘的标识，一般和立绘位置有关
   * @param url 立绘图片url
   * @param presetPosition
   */
  public addFigure(key: string, url: string, presetPosition: 'left' | 'center' | 'right' = 'center') {
    const loader = this.assetLoader;
    // 准备用于存放这个立绘的 Container
    const thisFigureContainer = new WebGALPixiContainer();

    // 是否有相同 key 的立绘
    const setFigIndex = this.figureObjects.findIndex((e) => e.key === key);
    const isFigSet = setFigIndex >= 0;

    // 已经有一个这个 key 的立绘存在了
    if (isFigSet) {
      this.removeStageObjectByKey(key);
    }

    // 挂载
    this.figureContainer.addChild(thisFigureContainer);
    const figureUuid = uuid();
    this.figureObjects.push({ uuid: figureUuid, key: key, pixiContainer: thisFigureContainer, sourceUrl: url });

    // 完成图片加载后执行的函数
    const setup = () => {
      const texture = loader.resources?.[url]?.texture;
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
          thisFigureContainer.setBaseY(this.stageHeight / 2 + this.stageHeight - targetHeight / 2);
        }
        if (presetPosition === 'center') {
          thisFigureContainer.setBaseX(this.stageWidth / 2);
        }
        if (presetPosition === 'left') {
          thisFigureContainer.setBaseX(targetWidth / 2);
        }
        if (presetPosition === 'right') {
          thisFigureContainer.setBaseX(this.stageWidth - targetWidth / 2);
        }
        thisFigureContainer.pivot.set(0, this.stageHeight / 2);
        thisFigureContainer.addChild(figureSprite);
      }
    };

    /**
     * 加载器部分
     */
    const resourses = Object.keys(loader.resources);
    this.cacheGC();
    if (!resourses.includes(url)) {
      this.loadAsset(url, setup);
    } else {
      // 复用
      setup();
    }
  }

  /**
   * Live2d立绘
   * @param jsonPath
   */
  // eslint-disable-next-line max-params
  // public addLive2dFigure(key: string, jsonPath: string, pos: string, motion: string) {
  //   let stageWidth = this.stageWidth;
  //   let stageHeight = this.stageHeight;
  //   logger.debug('Using motion:', motion);
  //
  //   figureCash.push(jsonPath);
  //
  //   const loader = this.assetLoader;
  //   // 准备用于存放这个立绘的 Container
  //   const thisFigureContainer = new WebGALPixiContainer();
  //
  //   // 是否有相同 key 的立绘
  //   const setFigIndex = this.figureObjects.findIndex((e) => e.key === key);
  //   const isFigSet = setFigIndex >= 0;
  //
  //   // 已经有一个这个 key 的立绘存在了
  //   if (isFigSet) {
  //     this.removeStageObjectByKey(key);
  //   }
  //
  //   // 挂载
  //   this.figureContainer.addChild(thisFigureContainer);
  //   this.figureObjects.push({ uuid: uuid(), key: key, pixiContainer: thisFigureContainer, sourceUrl: jsonPath });
  //
  //   const setup = () => {
  //     if (thisFigureContainer) {
  //       (async function () {
  //         const models = await Promise.all([Live2DModel.from(jsonPath)]);
  //
  //         models.forEach((model) => {
  //           const scaleX = stageWidth / model.width;
  //           const scaleY = stageHeight / model.height;
  //           const targetScale = Math.min(scaleX, scaleY) * 1.5;
  //           const targetWidth = model.width * targetScale;
  //           // const targetHeight = model.height * targetScale;
  //
  //           model.scale.set(targetScale);
  //           model.anchor.set(0.5);
  //           model.position.x = stageWidth / 2;
  //           model.position.y = stageHeight / 1.2;
  //
  //           if (pos === 'left') {
  //             model.position.x = targetWidth / 2;
  //           }
  //           if (pos === 'right') {
  //             model.position.x = stageWidth - targetWidth / 2;
  //           }
  //
  //           let category_name = motion;
  //           let animation_index = 0;
  //           let priority_number = 3;
  //           // var audio_link = voiceCash.pop();
  //
  //           // model.motion(category_name, animation_index, priority_number,location.href + audio_link);
  //           model.motion(category_name, animation_index, priority_number);
  //
  //           // lip-sync is still a problem and you can not.
  //           SoundManager.volume = 0;
  //           thisFigureContainer.addChild(model);
  //         });
  //       })();
  //     }
  //   };
  //
  //   /**
  //    * 加载器部分
  //    */
  //   const resourses = Object.keys(loader.resources);
  //   this.cacheGC();
  //   if (!resourses.includes(jsonPath)) {
  //     this.loadAsset(jsonPath, setup);
  //   } else {
  //     // 复用
  //     setup();
  //   }
  // }

  /**
   * 根据 key 获取舞台上的对象
   * @param key
   */
  public getStageObjByKey(key: string) {
    return [...this.figureObjects, ...this.backgroundObjects].find((e) => e.key === key);
  }

  public getStageObjByUuid(objUuid: string) {
    return [...this.figureObjects, ...this.backgroundObjects].find((e) => e.uuid === objUuid);
  }

  public getAllStageObj() {
    return [...this.figureObjects, ...this.backgroundObjects];
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
    // /**
    //  * 删掉相关 Effects，因为已经移除了
    //  */
    // const prevEffects = webgalStore.getState().stage.effects;
    // const newEffects = __.cloneDeep(prevEffects);
    // const index = newEffects.findIndex((e) => e.target === key);
    // if (index >= 0) {
    //   newEffects.splice(index, 1);
    // }
    // updateCurrentEffects(newEffects);
  }

  public cacheGC() {
    PIXI.utils.clearTextureCache();
  }

  private loadAsset(url: string, callback: () => void) {
    /**
     * Loader 复用疑似有问题，转而采用先前的单独方式
     */
    this.loadQueue.push({ url, callback });
    /**
     * 尝试启动加载
     */
    this.callLoader();
  }

  private callLoader() {
    if (!this.assetLoader.loading) {
      const front = this.loadQueue.shift();
      if (front) {
        try {
          if (this.assetLoader.resources[front.url]) {
            front.callback();
            this.callLoader();
          } else {
            this.assetLoader.add(front.url).load(() => {
              front.callback();
              this.callLoader();
            });
          }
        } catch (error) {
          logger.fatal('PIXI Loader 故障', error);
          front.callback();
          // this.assetLoader.reset(); // 暂时先不用重置
          this.callLoader();
        }
      }
    }
  }

  private updateFps() {
    getScreenFps?.(120).then((fps) => {
      this.frameDuration = 1000 / (fps as number);
      logger.info('当前帧率', fps);
    });
  }

  private lockStageObject(targetName: string) {
    this.lockTransformTarget.push(targetName);
  }

  private unlockStageObject(targetName: string) {
    const index = this.lockTransformTarget.findIndex((name) => name === targetName);
    if (index >= 0) this.lockTransformTarget.splice(index, 1);
  }
}

export function updateCurrentEffects(newEffects: IEffect[]) {
  /**
   * 更新当前 backlog 条目的 effects 记录
   */
  // if (!notUpdateBacklogEffects)
  //   setTimeout(() => {
  //     const backlog = RUNTIME_CURRENT_BACKLOG[RUNTIME_CURRENT_BACKLOG.length - 1];
  //     if (backlog) {
  //       const newBacklogItem = cloneDeep(backlog);
  //       const backlog_effects = newBacklogItem.currentStageState.effects;
  //       while (backlog_effects.length > 0) {
  //         backlog_effects.pop();
  //       }
  //       backlog_effects.push(...newEffects);
  //       RUNTIME_CURRENT_BACKLOG.pop();
  //       RUNTIME_CURRENT_BACKLOG.push(newBacklogItem);
  //     }
  //   }, 50);

  webgalStore.dispatch(setStage({ key: 'effects', value: newEffects }));
}

/**
 * @param {number} targetCount 不小于1的整数，表示经过targetCount帧之后返回结果
 * @return {Promise<number>}
 */
const getScreenFps = (() => {
  // 先做一下兼容性处理
  const nextFrame = [
    window.requestAnimationFrame,
    // @ts-ignore
    window.webkitRequestAnimationFrame,
    // @ts-ignore
    window.mozRequestAnimationFrame,
  ].find((fn) => fn);
  if (!nextFrame) {
    console.error('requestAnimationFrame is not supported!');
    return;
  }
  return (targetCount = 60) => {
    // 判断参数是否合规
    if (targetCount < 1) throw new Error('targetCount cannot be less than 1.');
    const beginDate = Date.now();
    let count = 0;
    return new Promise((resolve) => {
      (function log() {
        nextFrame(() => {
          if (++count >= targetCount) {
            const diffDate = Date.now() - beginDate;
            const fps = (count / diffDate) * 1000;
            return resolve(fps);
          }
          log();
        });
      })();
    });
  };
})();
