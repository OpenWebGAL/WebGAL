import { ITransform } from '@/store/stageInterface';
import { gsap } from 'gsap';
import { WebGAL } from '@/Core/WebGAL';
import { webgalStore } from '@/store/store';
import { stageActions } from '@/store/stageReducer';

/**
 * 动画创建模板
 * @param timeline
 * @param targetKey 作用目标
 * @param duration 持续时间
 */
export function generateTimelineObj(
  timeline: Array<ITransform & { duration: number }>,
  targetKey: string,
  duration: number,
) {
  const target = WebGAL.gameplay.pixiStage!.getStageObjByKey(targetKey);
  let gsapTimeline1: gsap.core.Timeline | null = gsap.timeline();
  let gsapTimeline2: gsap.core.Timeline | null = gsap.timeline();
  let gsapTimeline3: gsap.core.Timeline | null = gsap.timeline();
  let gsapTimeline4: gsap.core.Timeline | null = gsap.timeline();
  let gsapTimeline5: gsap.core.Timeline | null = gsap.timeline();
  const gsapTimelines = [gsapTimeline1, gsapTimeline2, gsapTimeline3, gsapTimeline4, gsapTimeline5];
  for (const gsapEffect of timeline) {
    const gsapEffectDuration = gsapEffect.duration;
    if (target?.pixiContainer) {
      gsapTimeline1.to(target.pixiContainer, {
        alpha: gsapEffect.alpha,
        rotation: gsapEffect.rotation,
        blur: gsapEffect.blur,
        duration: gsapEffectDuration,
      });
      gsapTimeline2.to(target.pixiContainer.scale, {
        ...gsapEffect.scale,
        duration: gsapEffectDuration,
      });
      gsapTimeline3.to(target.pixiContainer, {
        ...gsapEffect.position,
        duration: gsapEffectDuration,
      });
      /**
       * filters
       */
      const { alpha, rotation, blur, duration, scale, position, ...rest } = gsapEffect;
      gsapTimeline4.to(target.pixiContainer, {
        ...rest,
        duration: gsapEffectDuration,
      });
    }
  }

  const { duration: sliceDuration, ...endState } = getEndStateEffect();
  webgalStore.dispatch(stageActions.updateEffect({ target: targetKey, transform: endState }));

  /**
   * 在此书写为动画设置初态的操作
   */
  function setStartState() {}

  /**
   * 在此书写为动画设置终态的操作
   */
  function setEndState() {
    for (const gsaptimeline of gsapTimelines) {
      if (gsaptimeline) {
        gsaptimeline.seek(duration);
        gsaptimeline.kill();
      }
    }
    gsapTimeline1 = null;
    gsapTimeline2 = null;
    gsapTimeline3 = null;
    gsapTimeline4 = null;
    gsapTimeline5 = null;
  }

  /**
   * 在此书写动画每一帧执行的函数
   * @param delta
   */
  function tickerFunc(delta: number) {}

  function getEndFilterEffect() {
    const gsapEffect = timeline[timeline.length - 1];
    const { alpha, rotation, blur, duration, scale, position, ...rest } = gsapEffect;
    return rest;
  }

  function getEndStateEffect() {
    return timeline[timeline.length - 1];
  }

  return {
    setStartState,
    setEndState,
    tickerFunc,
    getEndFilterEffect,
  };
}
