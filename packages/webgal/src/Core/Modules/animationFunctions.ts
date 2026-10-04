import { logger } from '@/Core/util/logger';
import { generateUniversalSoftOffAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftOff';
import { baseTransform, ITransform } from '@/Core/Modules/stage/stageInterface';
import { generateTimelineObj, readContainerTransform } from '@/Core/controller/stage/pixi/animations/timeline';
import { WebGAL } from '@/Core/WebGAL';
import { IAnimationObject } from '@/Core/controller/stage/pixi/PixiController';
import { DEFAULT_BG_OUT_DURATION, DEFAULT_FIG_OUT_DURATION } from '../constants';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { buildAnimationTracks, getTracksEndState, IAnimationTrack } from '@/Core/Modules/animationTracks';

/**
 * 生成动画对象。目前只用于退出动画：退场的舞台对象在演算状态中已没有变换记录，因此从容器读取它的当前状态
 */
// eslint-disable-next-line max-params
export function getAnimationObject(
  animationName: string,
  target: string,
  duration: number,
  writeDefault: boolean,
  writeFullEffect = true,
) {
  const container = WebGAL.gameplay.pixiStage?.getStageObjByKey(target)?.pixiContainer;
  const currentTransform = container ? readContainerTransform(container) : baseTransform;
  const tracks = getAnimationTracks(animationName, currentTransform, writeDefault, writeFullEffect);
  if (tracks) {
    return generateTimelineObj(tracks, target, duration);
  }
  return null;
}

/**
 * 在演算期把动画终态写入 effects，并返回动画轨道供演出播放
 */
export function applyAnimationEndState(
  animationName: string,
  target: string,
  writeDefault: boolean,
  writeFullEffect = true,
) {
  const tracks = getAnimationTimeline(animationName, target, writeDefault, writeFullEffect);
  if (!tracks || tracks.length === 0) return null;
  stageStateManager.updateEffect({ target, transform: getTracksEndState(tracks) });
  return tracks;
}

/**
 * 以演算状态中目标的当前变换为起点，生成动画轨道
 */
export function getAnimationTimeline(
  animationName: string,
  target: string,
  writeDefault: boolean,
  writeFullEffect = true,
): IAnimationTrack[] | null {
  const targetEffect = stageStateManager.getCalculationStageState().effects.find((e) => e.target === target);
  const currentTransform = targetEffect?.transform ?? baseTransform;
  return getAnimationTracks(animationName, currentTransform, writeDefault, writeFullEffect);
}

/**
 * @param currentTransform 动画开始前目标的变换
 * @param writeDefault 为 true 时以 baseTransform 为当前基准状态（transformFrom=default）
 * @param writeFullEffect v1 动画中未涉及的属性是否也写入基准状态
 */
// eslint-disable-next-line max-params
function getAnimationTracks(
  animationName: string,
  currentTransform: ITransform,
  writeDefault: boolean,
  writeFullEffect: boolean,
): IAnimationTrack[] | null {
  const userAnimation = WebGAL.animationManager.getAnimations().find((ani) => ani.name === animationName);
  if (!userAnimation) return null;
  const tracks = buildAnimationTracks(userAnimation.animation, {
    base: writeDefault ? baseTransform : currentTransform,
    writeFullEffect,
  });
  logger.debug('装载自定义动画', tracks);
  return tracks;
}

export function getAnimateDuration(animationName: string) {
  const userAnimation = WebGAL.animationManager.getAnimations().find((ani) => ani.name === animationName);
  if (userAnimation) {
    let duration = 0;
    userAnimation.animation.keyframes.forEach((frame) => {
      duration += frame.duration;
    });
    return duration;
  }
  return 0;
}

/**
 * 取退出动画。
 *
 * 入场动画不在这里产出：它由 changeFigure/changeBg 作为普通演出返回，
 * 终态在演算期写入 effects，因此不需要视图层反推该播哪个动画。
 */
export function getExitAnimation(
  target: string,
  isBg = false,
  realTarget?: string, // 用于立绘和背景移除时，以当前时间打上特殊标记
): {
  duration: number;
  animation: IAnimationObject | null;
} {
  let duration = isBg ? DEFAULT_BG_OUT_DURATION : DEFAULT_FIG_OUT_DURATION;
  const animationSettings = stageStateManager
    .getCalculationStageState()
    .animationSettings.find((setting) => setting.target === target);
  duration = animationSettings?.exitDuration ?? duration;
  // 走默认动画
  let animation: IAnimationObject | null = generateUniversalSoftOffAnimationObj(realTarget ?? target, duration);
  const animationName = animationSettings?.exitAnimationName;
  if (animationName) {
    logger.debug('取代默认退出动画', target);
    animation = getAnimationObject(
      animationName,
      realTarget ?? target,
      getAnimateDuration(animationName),
      false,
      !(animationSettings?.exitAnimationIgnoreDefault ?? false),
    );
    duration = getAnimateDuration(animationName);
  }
  if (animationSettings) {
    // 退出动画拿完后，删了这个设定
    stageStateManager.removeAnimationSettingsByTargetOff(target);
    logger.debug('删除退出动画设定', target);
  }
  return { duration, animation };
}
