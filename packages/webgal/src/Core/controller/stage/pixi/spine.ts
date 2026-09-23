// spineHandlers.ts
import { WebGALPixiContainer } from '@/Core/controller/stage/pixi/WebGALPixiContainer';
import { v4 as uuid } from 'uuid';
import * as PIXI from 'pixi.js';
import PixiStage from '@/Core/controller/stage/pixi/PixiController';
import { logger } from '@/Core/util/logger';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { getFigureBaseX, IFigurePosition } from '@/Core/Modules/stage/stageInterface';
// utils/loadPixiSpine.ts
// @ts-ignore
let pixiSpineModule: typeof import('pixi-spine') | null = null;
// @ts-ignore
let pixiSpineLoading: Promise<typeof import('pixi-spine') | null> | null = null;

// Spine 必须由用户按 https://docs.openwebgal.com/spine.html 显式启用。

/**
 * 动态加载 'pixi-spine' 模块，并缓存结果
 * @returns {Promise<typeof import('pixi-spine') | null>}
 */
// @ts-ignore
export async function loadPixiSpine(): Promise<typeof import('pixi-spine') | null> {
  if (pixiSpineModule) {
    return pixiSpineModule;
  }

  if (pixiSpineLoading) {
    return pixiSpineLoading;
  }

  // @ts-ignore
  // pixiSpineLoading = import('pixi-spine')
  //   .then((module) => {
  //     pixiSpineModule = module;
  //     return module;
  //   })
  //   .catch((error) => {
  //     console.error('Failed to load pixi-spine. Spine features will be disabled.', error);
  //     return null;
  //   })
  //   .finally(() => {
  //     pixiSpineLoading = null;
  //   });

  return pixiSpineLoading;
}

/**
 * 添加 Spine 立绘的实现函数
 * @param key 立绘的标识
 * @param url Spine 数据的 URL
 * @param presetPosition 预设位置
 */
// eslint-disable-next-line max-params
export async function addSpineFigureImpl(
  this: PixiStage,
  key: string,
  url: string,
  presetPosition: IFigurePosition = 'center',
) {
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
  }
  // 挂载
  this.figureContainer.addChild(thisFigureContainer);
  const figureUuid = uuid();
  this.figureObjects.push({
    uuid: figureUuid,
    key: key,
    pixiContainer: thisFigureContainer,
    sourceUrl: url,
    sourceType: 'spine', // 修改为 'spine'
    sourceExt: this.getExtName(url),
    spineAnimation: '_initial',
  });

  // 完成图片加载后执行的函数
  const setup = async () => {
    const pixiSpine = await loadPixiSpine();
    // 对象已同步入表，资源就绪后直接挂载；动画由 commit 后的演出启动。
    console.log('Setting up Spine' + key + url);
    if (!pixiSpine) {
      // 无法加载 'pixi-spine'，跳过 Spine 相关逻辑
      logger.warn(`Spine module not loaded. Skipping Spine figure: ${key}`);
      return;
    }

    const { Spine } = pixiSpine;
    const spineResource: any = this.assets.getReady({ url, kind: 'spine' });
    if (spineResource && this.getStageObjByUuid(figureUuid)) {
      const figureSpine = new Spine(spineResource.spineData);
      const spineBounds = figureSpine.getLocalBounds();
      const spineCenterX = spineBounds.x + spineBounds.width / 2;
      const spineCenterY = spineBounds.y + spineBounds.height / 2;
      figureSpine.pivot.set(spineCenterX, spineCenterY);
      figureSpine.interactive = false;

      const motionFromState = stageStateManager.getViewStageState().live2dMotion.find((e) => e.target === key);
      let animationToPlay = '';
      if (motionFromState?.skin) {
        if (!applySpineSkin(figureSpine, motionFromState.skin)) {
          logger.warn(`Spine skin not found: ${motionFromState.skin} on ${key}`);
        }
      }

      if (
        motionFromState &&
        figureSpine.spineData.animations.find((anim: any) => anim.name === motionFromState.motion)
      ) {
        // 使用状态中指定的动画
        animationToPlay = motionFromState.motion;
      } else if (figureSpine.spineData.animations.length > 0) {
        // 播放默认动画（第一个动画）
        animationToPlay = figureSpine.spineData.animations[0].name;
      }

      if (animationToPlay) {
        figureSpine.state.setAnimation(0, animationToPlay, false);
        figureSpine.autoUpdate = true;
        const stageObj = this.getStageObjByUuid(figureUuid);
        if (stageObj) {
          if (stageObj.spineAnimation) {
            stageObj.spineAnimation = animationToPlay;
          }
        }
      }

      /**
       * 重设大小
       */
      const originalWidth = figureSpine.width;
      const originalHeight = figureSpine.height;
      const scaleX = this.stageWidth / originalWidth;
      const scaleY = this.stageHeight / originalHeight;
      const targetScale = Math.min(scaleX, scaleY);
      const figureSprite = new PIXI.Sprite();
      figureSprite.addChild(figureSpine);
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
      this.notifyTargetReferenceBoxChanged(key);
      this.requestRender();
    }
  };

  this.loadStageAsset(figureUuid, setup, { url, kind: 'spine' });
}

/**
 * 添加 Spine 背景的实现函数
 * @param key 背景的标识
 * @param url Spine 数据的 URL
 */
export async function addSpineBgImpl(this: PixiStage, key: string, url: string) {
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
    sourceType: 'spine', // 修改为 'spine'
    sourceExt: this.getExtName(url),
  });

  // 完成图片加载后执行的函数
  const setup = async () => {
    const pixiSpine = await loadPixiSpine();
    if (!pixiSpine) {
      // 无法加载 'pixi-spine'，跳过 Spine 相关逻辑
      logger.warn(`Spine module not loaded. Skipping Spine background: ${key}`);
      return;
    }

    const { Spine } = pixiSpine;
    const spineResource: any = this.assets.getReady({ url, kind: 'spine' });
    // 对象已同步入表，资源就绪后直接挂载；动画由 commit 后的演出启动。
    if (spineResource && this.getStageObjByUuid(bgUuid)) {
      const bgSpine = new Spine(spineResource.spineData);
      const transY = spineResource?.spineData?.y ?? 0;
      /**
       * 重设大小
       */
      const originalWidth = bgSpine.width; // TODO: 视图大小可能小于画布大小，应提供参数指定视图大小
      const originalHeight = bgSpine.height; // TODO: 视图大小可能小于画布大小，应提供参数指定视图大小
      const scaleX = this.stageWidth / originalWidth;
      const scaleY = this.stageHeight / originalHeight;
      logger.debug('bgSpine state', bgSpine.state);
      // TODO: 也许应该使用 setAnimation 播放初始动画
      if (bgSpine.spineData.animations.length > 0) {
        // 播放首个动画
        bgSpine.state.setAnimation(0, bgSpine.spineData.animations[0].name, true);
      }
      const targetScale = Math.max(scaleX, scaleY);
      const bgSprite = new PIXI.Sprite();
      bgSprite.addChild(bgSpine);
      bgSprite.scale.x = targetScale;
      bgSprite.scale.y = targetScale;
      bgSprite.anchor.set(0.5);
      bgSprite.position.y = this.stageHeight / 2;
      thisBgContainer.setBaseX(this.stageWidth / 2);
      thisBgContainer.setBaseY(this.stageHeight / 2);
      thisBgContainer.pivot.set(0, this.stageHeight / 2);

      // 挂载
      thisBgContainer.addChild(bgSprite);
      this.notifyTargetReferenceBoxChanged(key);
      this.requestRender();
    }
  };

  this.loadStageAsset(bgUuid, setup, { url, kind: 'spine' });
}

function applySpineSkin(spineObject: any, skinName: string) {
  // @ts-ignore
  const skeleton = spineObject.skeleton;
  // @ts-ignore
  const skeletonData = skeleton?.data ?? spineObject.spineData;
  const skin =
    // @ts-ignore
    skeletonData?.findSkin?.(skinName) ??
    // @ts-ignore
    skeletonData?.skins?.find((item: any) => item.name === skinName);
  if (!skeleton || !skin) {
    return false;
  }
  try {
    // @ts-ignore
    if (typeof skeleton.setSkinByName === 'function') {
      // @ts-ignore
      skeleton.setSkinByName(skinName);
    } else {
      // @ts-ignore
      skeleton.setSkin(skin);
    }
  } catch (error) {
    // @ts-ignore
    skeleton.setSkin?.(skin);
  }
  // @ts-ignore
  if (typeof skeleton.setSlotsToSetupPose === 'function') {
    // @ts-ignore
    skeleton.setSlotsToSetupPose();
  } else {
    // @ts-ignore
    skeleton.setupPoseSlots?.();
  }
  return true;
}
