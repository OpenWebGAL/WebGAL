import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { logger } from '@/Core/util/logger';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { getBooleanArgByKey, getNumberArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { IStageState } from '@/store/stageInterface';
import {
  audioContextWrapper,
  getAudioLevel,
  performBlinkAnimation,
  performMouthAnimation,
  updateThresholds,
} from '@/Core/gameScripts/vocal/vocalAnimation';
import { match } from '../../util/match';
import { WebGAL } from '@/Core/WebGAL';

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
  currentStageState = webgalStore.getState().stage;

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
  let VocalControl: any = document.getElementById('currentVocal');
  WebGAL.gameplay.performController.unmountPerform('vocal-play', true);
  if (VocalControl !== null) {
    VocalControl.currentTime = 0;
    VocalControl.pause();
  }

  // 获得舞台状态
  webgalStore.dispatch(setStage({ key: 'playVocal', value: url }));
  webgalStore.dispatch(setStage({ key: 'vocal', value: url }));

  let isOver = false;

  /**
   * 嘴型同步
   */

  return {
    arrangePerformPromise: new Promise((resolve) => {
      // 播放语音
      setTimeout(() => {
        let VocalControl: any = document.getElementById('currentVocal');
        // 设置语音音量
        webgalStore.dispatch(setStage({ key: 'vocalVolume', value: volume }));
        // 设置语音
        if (VocalControl !== null) {
          VocalControl.currentTime = 0;
          // 播放并作为一个特别演出加入
          const perform = {
            performName: performInitName,
            duration: 1000 * 60 * 60,
            isOver: false,
            isHoldOn: false,
            stopFunction: () => {
              clearInterval(audioContextWrapper.audioLevelInterval);
              VocalControl.pause();
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
            skipNextCollect: true,
            stopTimeout: undefined, // 暂时不用，后面会交给自动清除
          };
          WebGAL.gameplay.performController.arrangeNewPerform(perform, sentence, false);
          key = key ? key : `fig-${pos}`;
          const animationItem = figureAssociatedAnimation.find((tid) => tid.targetId === key);
          if (animationItem) {
            let maxAudioLevel = 0;

            const foundFigure = freeFigure.find((figure) => figure.key === key);

            if (foundFigure) {
              pos = foundFigure.basePosition;
            }

            if (!audioContextWrapper.audioContext) {
              let audioContext: AudioContext | null;
              audioContext = new AudioContext();
              audioContextWrapper.analyser = audioContext.createAnalyser();
              audioContextWrapper.analyser.fftSize = 256;
              audioContextWrapper.dataArray = new Uint8Array(audioContextWrapper.analyser.frequencyBinCount);
            }

            if (!audioContextWrapper.analyser) {
              audioContextWrapper.analyser = audioContextWrapper.audioContext.createAnalyser();
              audioContextWrapper.analyser.fftSize = 256;
            }

            bufferLength = audioContextWrapper.analyser.frequencyBinCount;
            audioContextWrapper.dataArray = new Uint8Array(bufferLength);
            let vocalControl = document.getElementById('currentVocal') as HTMLMediaElement;

            if (!audioContextWrapper.source || audioContextWrapper.source.mediaElement !== vocalControl) {
              if (audioContextWrapper.source) {
                audioContextWrapper.source.disconnect();
              }
              audioContextWrapper.source = audioContextWrapper.audioContext.createMediaElementSource(vocalControl);
              audioContextWrapper.source.connect(audioContextWrapper.analyser!);
            }

            audioContextWrapper.analyser.connect(audioContextWrapper.audioContext.destination);

            // Lip-snc Animation
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

            // blinkAnimation
            let animationEndTime: number;

            // 10sec
            animationEndTime = Date.now() + 10000;
            performBlinkAnimation({ key, animationItem, pos, animationEndTime });

            // 10sec
            setTimeout(() => {
              clearTimeout(audioContextWrapper.blinkTimerID);
            }, 10000);
          }

          VocalControl?.play();

          VocalControl.onended = () => {
            for (const e of WebGAL.gameplay.performController.performList) {
              if (e.performName === performInitName) {
                isOver = true;
                e.stopFunction();
                WebGAL.gameplay.performController.unmountPerform(e.performName);
              }
            }
          };
        }
      }, 1);
    }),
  };
};
