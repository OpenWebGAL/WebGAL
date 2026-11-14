import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { logger } from '@/Core/util/logger';
import { getFigurePositionFromArgs, getNumberArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { IStageState } from '@/Core/Modules/stage/stageInterface';
import {
  audioContextWrapper,
  ensureAudioContextReady,
  getAudioLevel,
  performBlinkAnimation,
  performMouthAnimation,
  resetMaxAudioLevel,
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

  let pos = getFigurePositionFromArgs(sentence) || 'center';

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

  const finishPerform = (error?: unknown) => {
    if (error) {
      logger.warn('Vocal play was blocked by browser autoplay policy or audio activation state.', error);
    }
    isOver = true;
    WebGAL.gameplay.performController.unmountPerform(performInitName);
  };

  /**
   * 嘴型同步
   */

  return {
    performName: performInitName,
    duration: 1000 * 60 * 60,
    isHoldOn: false,
    skipNextCollect: true,
    startFunction: () => {
      // commit 只同步舞台状态，音频元素的 key/src 和音量仍由 React 渲染及 effect 更新。
      // 暂留延时避免操作旧元素；1ms 不保证就绪，移除前应改为音频元素就绪通知。
      startTimer = setTimeout(async () => {
        if (isOver) return;
        let VocalControl = document.getElementById('currentVocal') as HTMLMediaElement | null;
        if (VocalControl === null) {
          finishPerform();
          return;
        }
        key = key ? key : `fig-${pos}`;
        const animationItem = figureAssociatedAnimation.find((tid) => tid.targetId === key);
        if (animationItem) {
          resetMaxAudioLevel();
          const foundFigure = freeFigure.find((figure) => figure.key === key);

          if (foundFigure) {
            pos = foundFigure.basePosition;
          }

          const isAudioContextReady = await ensureAudioContextReady();
          // 等待 AudioContext 恢复期间演出可能已被提前结束，此时不能再挂载定时器或继续播放。
          if (isOver) return;
          VocalControl = document.getElementById('currentVocal') as HTMLMediaElement | null;
          if (VocalControl === null) {
            finishPerform();
            return;
          }
          if (isAudioContextReady && audioContextWrapper.audioContext) {
            if (!audioContextWrapper.analyser) {
              audioContextWrapper.analyser = audioContextWrapper.audioContext.createAnalyser();
              audioContextWrapper.analyser.fftSize = 256;
            }

            bufferLength = audioContextWrapper.analyser.frequencyBinCount;
            audioContextWrapper.dataArray = new Uint8Array(bufferLength);

            if (!audioContextWrapper.source || audioContextWrapper.source.mediaElement !== VocalControl) {
              if (audioContextWrapper.source) {
                audioContextWrapper.source.disconnect();
              }
              audioContextWrapper.source = audioContextWrapper.audioContext.createMediaElementSource(VocalControl);
              audioContextWrapper.source.connect(audioContextWrapper.analyser);
            }

            audioContextWrapper.analyser.connect(audioContextWrapper.audioContext.destination);

            // Lip-sync Animation
            clearInterval(audioContextWrapper.audioLevelInterval);
            audioContextWrapper.audioLevelInterval = setInterval(() => {
              if (isOver) {
                clearInterval(audioContextWrapper.audioLevelInterval);
                audioContextWrapper.audioLevelInterval = undefined;
                return;
              }
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
          } else {
            logger.warn('AudioContext is not ready, skip lip-sync analyzer for this vocal.');
          }

          const animationEndTime = Date.now() + 10000;
          performBlinkAnimation({ key, animationItem, pos, animationEndTime });

          // 到达本轮眨眼的 10 秒时限后取消后续调度，不能在启动时就清除。
          blinkEndTimer = setTimeout(() => {
            clearTimeout(audioContextWrapper.blinkTimerID);
            audioContextWrapper.blinkTimerID = undefined;
          }, 10000);
        }

        VocalControl.currentTime = 0;
        VocalControl.play().catch(finishPerform);

        VocalControl.onended = () => {
          finishPerform();
        };
      }, 1);
    },
    stopFunction: () => {
      isOver = true;
      if (startTimer) {
        clearTimeout(startTimer);
        startTimer = undefined;
      }
      if (blinkEndTimer) {
        clearTimeout(blinkEndTimer);
        blinkEndTimer = undefined;
      }
      clearInterval(audioContextWrapper.audioLevelInterval);
      audioContextWrapper.audioLevelInterval = undefined;
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
      audioContextWrapper.blinkTimerID = undefined;
    },
    blockingNext: () => false,
    blockingAuto: () => {
      return !isOver;
    },
  };
};
