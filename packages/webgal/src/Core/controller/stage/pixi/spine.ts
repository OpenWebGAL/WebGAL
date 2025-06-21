// spineHandlers.ts
import { WebGALPixiContainer } from '@/Core/controller/stage/pixi/WebGALPixiContainer';
import { v4 as uuid } from 'uuid';
import * as PIXI from 'pixi.js';
import PixiStage from '@/Core/controller/stage/pixi/PixiController';
import { logger } from '@/Core/util/logger';
import { webgalStore } from '@/store/store';
// utils/loadPixiSpine.ts
// @ts-ignore
let pixiSpineModule: typeof import('pixi-spine') | null = null;
// @ts-ignore
let pixiSpineLoading: Promise<typeof import('pixi-spine') | null> | null = null;

let spineLoader: undefined | PIXI.Loader;

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
  //     spineLoader = new PIXI.Loader();
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
  presetPosition: 'left' | 'center' | 'right' = 'center',
) {
  const spineId = `spine-${url}`;
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
  const pixiSpine = await loadPixiSpine();

  // 完成图片加载后执行的函数
  const setup = async () => {
    setTimeout(() => {
      console.log('Setting up Spine' + key + url);
      if (!pixiSpine) {
        // 无法加载 'pixi-spine'，跳过 Spine 相关逻辑
        logger.warn(`Spine module not loaded. Skipping Spine figure: ${key}`);
        return;
      }

      const { Spine } = pixiSpine;
      const spineResource: any = spineLoader!.resources?.[spineId];
      if (spineResource && this.getStageObjByUuid(figureUuid)) {
        const figureSpine = new Spine(spineResource.spineData);
        const spineBounds = figureSpine.getLocalBounds();
        const spineCenterX = spineBounds.x + spineBounds.width / 2;
        const spineCenterY = spineBounds.y + spineBounds.height / 2;
        figureSpine.pivot.set(spineCenterX, spineCenterY);
        figureSpine.interactive = false;

        // 检查状态中是否有指定的动画
        const motionFromState = webgalStore.getState().stage.live2dMotion.find((e) => e.target === key);
        let animationToPlay = '';

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
    }, 0);
  };

  /**
   * 加载器部分
   * 这里不再使用 this.loadAsset，因为我们可能需要单独管理 Spine 资源
   * 但为了避免性能问题，我们继续使用现有的 loader，并确保资源只加载一次
   */
  this.cacheGC();
  if (!spineLoader!.resources?.[spineId]) {
    spineLoader!.add(spineId, url).load(setup);
  } else {
    // 复用
    await setup();
  }
}

/**
 * 添加 Spine 背景的实现函数
 * @param key 背景的标识
 * @param url Spine 数据的 URL
 */
export async function addSpineBgImpl(this: PixiStage, key: string, url: string) {
  const spineId = `spine-${url}`;
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
    const spineResource: any = spineLoader!.resources?.[spineId];
    // TODO：找一个更好的解法，现在的解法是无论是否复用原来的资源，都设置一个延时以让动画工作正常！
    setTimeout(() => {
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
      }
    }, 0);
  };

  /**
   * 加载器部分
   * 这里不再使用 this.loadAsset，因为我们可能需要单独管理 Spine 资源
   * 但为了避免性能问题，我们继续使用现有的 loader，并确保资源只加载一次
   */
  this.cacheGC();
  if (!spineLoader!.resources?.[spineId]) {
    spineLoader!.add(spineId, url).load(setup);
  } else {
    // 复用
    await setup();
  }
}
