import type { IStageAnimationSetting } from '@/Core/Modules/stage/stageInterface';
import { getAnimateDuration, getAnimationTimeline } from '@/Core/Modules/animationFunctions';
import { generateTimelineObj } from '@/Core/controller/stage/pixi/animations/timeline';
import { WebGAL } from '@/Core/WebGAL';

const timers = new Map<string, ReturnType<typeof setTimeout>>();

export function playDeferredCharacterPresentation(target: string, setting: IStageAnimationSetting | undefined): void {
  clearDeferredCharacterPresentation(target);
  if (!setting?.enterAnimationName || WebGAL.gameplay.skipAnimation) return;

  const duration = getAnimateDuration(setting.enterAnimationName);
  const timeline = getAnimationTimeline(
    setting.enterAnimationName,
    target,
    false,
    !(setting.enterAnimationIgnoreDefault ?? false),
    setting.baseTransform,
  );
  if (!timeline) return;
  const animation = generateTimelineObj(timeline, target, duration);

  const animationKey = getAnimationKey(target);
  WebGAL.gameplay.pixiStage?.registerAnimation(animation, animationKey, target);
  if (duration <= 0) {
    WebGAL.gameplay.pixiStage?.removeAnimation(animationKey);
    return;
  }
  timers.set(
    target,
    setTimeout(() => {
      timers.delete(target);
      WebGAL.gameplay.pixiStage?.removeAnimation(animationKey);
    }, duration),
  );
}

export function clearDeferredCharacterPresentation(target: string): void {
  const timer = timers.get(target);
  if (timer !== undefined) {
    clearTimeout(timer);
    timers.delete(target);
  }
  WebGAL.gameplay.pixiStage?.removeAnimation(getAnimationKey(target));
}

function getAnimationKey(target: string): string {
  return `${target}-deferred-enter`;
}
