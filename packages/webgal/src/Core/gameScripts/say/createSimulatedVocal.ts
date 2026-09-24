import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { performMouthAnimation } from '../vocal/vocalAnimation';

/** 模拟嘴型只负责启动和停止，不决定对话时长。 */
export function createSimulatedVocal(pos: string, key: string) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let audioLevel = 80;
  const update = (end = false) => {
    let nextAudioLevel = audioLevel + (Math.random() * 60 - 30);
    // 保留原来的说话节奏：变化幅度至少为 5，音量限制在 15 到 100。
    if (Math.abs(nextAudioLevel - audioLevel) < 5) {
      nextAudioLevel = audioLevel + Math.sign(nextAudioLevel - audioLevel) * 5;
    }
    audioLevel = end ? 0 : Math.max(15, Math.min(nextAudioLevel, 100));
    const state = stageStateManager.getCalculationStageState();
    const animationItem = state.figureAssociatedAnimation.find((item) => item.targetId === key);
    performMouthAnimation({
      audioLevel,
      OPEN_THRESHOLD: 50,
      HALF_OPEN_THRESHOLD: 25,
      currentMouthValue: 0,
      lerpSpeed: 1,
      key: key || `fig-${pos}`,
      animationItem,
      pos,
    });
    if (!end) timeout = setTimeout(update, 50);
  };
  return {
    start: () => update(),
    stop: () => {
      if (timeout === null) return;
      clearTimeout(timeout);
      timeout = null;
      update(true);
    },
  };
}
