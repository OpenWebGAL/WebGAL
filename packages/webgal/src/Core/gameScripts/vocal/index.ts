import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { logger } from '@/Core/util/logger';
import { getBooleanArgByKey, getNumberArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { IStageState } from '@/Core/Modules/stage/stageInterface';
import {
  audioContextWrapper,
  getAudioLevel,
  performBlinkAnimation,
  performMouthAnimation,
  updateThresholds,
} from '@/Core/gameScripts/vocal/vocalAnimation';
import { WebGAL } from '@/Core/WebGAL';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';

/**
 * 播放一段语音
 * @param sentence 语句
 */
export const playVocal = (sentence: ISentence) => {
  logger.debug('play vocal');
  const performInitName = 'vocal-play';

  const url = getStringArgByKey(sentence, 'vocal') ?? ''; // 获取语音的url
  let volume = getNumberArgByKey(sentence, 'volume') ?? 100; // 获取语音的音量比
  volume = Math.max(0, Math.min(volume, 100)); // 限制音量在 0-100 之间

  let currentStageState: IStageState;
  currentStageState = stageStateManager.getCalculationStageState();

  let pos: 'center' | 'left' | 'right' = 'center';
  const leftFromArgs = getBooleanArgByKey(sentence, 'left') ?? false;
  const rightFromArgs = getBooleanArgByKey(sentence, 'right') ?? false;
  if (leftFromArgs) pos = 'left';
  if (rightFromArgs) pos = 'right';

  let key = getStringArgByKey(sentence, 'figureId') ?? '';

  const freeFigure = currentStageState.freeFigure;
  const figureAssociatedAnimation = currentStageState.figureAssociatedAnimation;
  let bufferLength = 0;
  let currentMouthValue = 0;
  const lerpSpeed = 1;

  // 先停止之前的语音
  WebGAL.gameplay.performController.unmountPerform('vocal-play', true);

  // 获得舞台状态
  stageStateManager.setStage('playVocal', url);
  stageStateManager.setStage('vocal', url);
  stageStateManager.setStage('vocalVolume', volume);

  let isOver = false;
  let startTimer: ReturnType<typeof setTimeout> | undefined;
  let blinkEndTimer: ReturnType<typeof setTimeout> | undefined;

  /**
   * 嘴型同步
   */

  return {
    performName: performInitName,
    duration: 1000 * 60 * 60,
    isHoldOn: false,
    skipNextCollect: true,
    startFunction: () => {
      startTimer = setTimeout(() => {
        const VocalControl = document.getElementById('currentVocal') as HTMLMediaElement | null;
        if (VocalControl === null) {
          isOver = true;
          return;
        }
        VocalControl.currentTime = 0;
        key = key ? key : `fig-${pos}`;
        const animationItem = figureAssociatedAnimation.find((tid) => tid.targetId === key);
        if (animationItem) {
          const foundFigure = freeFigure.find((figure) => figure.key === key);

          if (foundFigure) {
            pos = foundFigure.basePosition;
          }

          if (!audioContextWrapper.analyser) {
            audioContextWrapper.analyser = audioContextWrapper.audioContext.createAnalyser();
            audioContextWrapper.analyser.fftSize = 256;
          }

          bufferLength = audioContextWrapper.analyser.frequencyBinCount;
          audioContextWrapper.dataArray = new Uint8Array(bufferLength);
          const vocalControl = document.getElementById('currentVocal') as HTMLMediaElement;

          if (!audioContextWrapper.source || audioContextWrapper.source.mediaElement !== vocalControl) {
            if (audioContextWrapper.source) {
              audioContextWrapper.source.disconnect();
            }
            audioContextWrapper.source = audioContextWrapper.audioContext.createMediaElementSource(vocalControl);
            audioContextWrapper.source.connect(audioContextWrapper.analyser);
          }

          audioContextWrapper.analyser.connect(audioContextWrapper.audioContext.destination);

          // Lip-sync Animation
          audioContextWrapper.audioLevelInterval = setInterval(() => {
            const audioLevel = getAudioLevel(
              audioContextWrapper.analyser!,
              audioContextWrapper.dataArray!,
              bufferLength,
            );
            const { OPEN_THRESHOLD, HALF_OPEN_THRESHOLD } = updateThresholds(audioLevel);

            performMouthAnimation({
              audioLevel,
              OPEN_THRESHOLD,
              HALF_OPEN_THRESHOLD,
              currentMouthValue,
              lerpSpeed,
              key,
              animationItem,
              pos,
            });
          }, 50);

          const animationEndTime = Date.now() + 10000;
          performBlinkAnimation({ key, animationItem, pos, animationEndTime });

          blinkEndTimer = setTimeout(() => {
            clearTimeout(audioContextWrapper.blinkTimerID);
          }, 10000);
        }

        VocalControl.play().catch(() => {});

        VocalControl.onended = () => {
          isOver = true;
          WebGAL.gameplay.performController.unmountPerform(performInitName);
        };
      }, 1);
    },
    stopFunction: () => {
      if (startTimer) clearTimeout(startTimer);
      if (blinkEndTimer) clearTimeout(blinkEndTimer);
      clearInterval(audioContextWrapper.audioLevelInterval);
      const VocalControl = document.getElementById('currentVocal') as HTMLMediaElement | null;
      if (VocalControl) {
        VocalControl.pause();
        VocalControl.onended = null;
      }
      key = key ? key : `fig-${pos}`;
      const animationItem = figureAssociatedAnimation.find((tid) => tid.targetId === key);
      performMouthAnimation({
        audioLevel: 0,
        OPEN_THRESHOLD: 1,
        HALF_OPEN_THRESHOLD: 1,
        currentMouthValue,
        lerpSpeed,
        key,
        animationItem,
        pos,
      });
      clearTimeout(audioContextWrapper.blinkTimerID);
    },
    blockingNext: () => false,
    blockingAuto: () => {
      return !isOver;
    },
  };
};
