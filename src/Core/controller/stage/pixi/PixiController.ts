import * as PIXI from 'pixi.js';
import { v4 as uuid } from 'uuid';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import __ from 'lodash';
import { IEffect } from '@/store/stageInterface';
import { RUNTIME_CURRENT_BACKLOG } from '@/Core/runtime/backlog';

export interface IAnimationObject {
  setStartState: Function;
  setEndState: Function;
  tickerFunc: PIXI.TickerCallback<number>;
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
  public stageAnimations: Array<IStageAnimationObject> = [];

  // 锁定变换对象（对象可能正在执行动画，不能应用变换）
  private lockTransformTarget: Array<string> = [];
  private stageWidth = 2560;
  private stageHeight = 1440;

  public constructor() {
    const app = new PIXI.Application({
      backgroundAlpha: 0,
      preserveDrawingBuffer: true,
    });
    // @ts-ignore
    window.PIXIapp = this;
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

  public getAllLockedObject() {
    return this.lockTransformTarget;
  }

  /**
   * 注册动画
   * @param animationObject
   * @param key
   * @param target
   */
  public registerAnimation(animationObject: IAnimationObject, key: string, target = 'default') {
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
    animationObject: IAnimationObject,
    key: string,
    target = 'default',
    currentEffects: IEffect[],
  ) {
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

  public removeAnimationWithSetEffects(key: string, notUpdateBacklogEffects = false) {
    const index = this.stageAnimations.findIndex((e) => e.key === key);
    if (index >= 0) {
      const thisTickerFunc = this.stageAnimations[index];
      this.currentApp?.ticker.remove(thisTickerFunc.animationObject.tickerFunc);
      thisTickerFunc.animationObject.setEndState();
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
          };
          const prevEffects = webgalStore.getState().stage.effects;
          const newEffects = __.cloneDeep(prevEffects);
          let effect: IEffect = { target: thisTickerFunc.targetKey, transform: targetTransform };
          const index = newEffects.findIndex((e) => e.target === thisTickerFunc.targetKey);
          if (index >= 0) {
            effect = newEffects[index];
            effect.transform = targetTransform;
            newEffects[index] = effect;
          } else {
            newEffects.push(effect);
          }
          updateCurrentEffects(newEffects, notUpdateBacklogEffects);
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
  }

  /**
   * 添加立绘
   * @param key 立绘的标识，一般和立绘位置有关
   * @param url 立绘图片url
   * @param presetPosition
   */
  public addFigure(key: string, url: string, presetPosition: 'left' | 'center' | 'right' = 'center') {
    const loader = new PIXI.Loader();

    // 准备用于存放这个立绘的 Container
    const thisFigureContainer = new PIXI.Container();

    // 是否有相同 key 的立绘
    const setFigIndex = this.figureObjects.findIndex((e) => e.key === key);
    const isFigSet = setFigIndex >= 0;

    // 已经有一个这个 key 的立绘存在了
    if (isFigSet) {
      this.removeStageObjectByKey(key);
    }

    // 挂载
    this.figureContainer.addChild(thisFigureContainer);
    this.figureObjects.push({ uuid: uuid(), key: key, pixiContainer: thisFigureContainer, sourceUrl: url });

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
  }

  /**
   * 根据 key 获取舞台上的对象
   * @param key
   */
  public getStageObjByKey(key: string) {
    return [...this.figureObjects, ...this.backgroundObjects].find((e) => e.key === key);
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

  private lockStageObject(targetName: string) {
    this.lockTransformTarget.push(targetName);
  }

  private unlockStageObject(targetName: string) {
    const index = this.lockTransformTarget.findIndex((name) => name === targetName);
    if (index >= 0) this.lockTransformTarget.splice(index, 1);
  }
}

export function updateCurrentEffects(newEffects: IEffect[], notUpdateBacklogEffects = false) {
  /**
   * 更新当前 backlog 条目的 Transform 记录
   */
  if (!notUpdateBacklogEffects)
    setTimeout(() => {
      const backlog = RUNTIME_CURRENT_BACKLOG[RUNTIME_CURRENT_BACKLOG.length - 1];
      const newBacklogItem = __.cloneDeep(backlog);
      const backlog_effects = newBacklogItem.currentStageState.effects;
      while (backlog_effects.length > 0) {
        backlog_effects.pop();
      }
      backlog_effects.push(...newEffects);
      RUNTIME_CURRENT_BACKLOG.pop();
      RUNTIME_CURRENT_BACKLOG.push(newBacklogItem);
    }, 50);

  webgalStore.dispatch(setStage({ key: 'effects', value: newEffects }));
}
