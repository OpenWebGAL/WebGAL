import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { logger } from '@/Core/util/etc/logger';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { WebGAL } from '@/main';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { IStageState } from '@/store/stageInterface';
let audioContext = new AudioContext();
let source: MediaElementAudioSourceNode | null = null;
let analyser: AnalyserNode | undefined;
let dataArray: Uint8Array | undefined;
let audioLevelInterval: any = null;

/**
 * 播放一段语音
 * @param sentence 语句
 */
export const playVocal = (sentence: ISentence) => {
  logger.debug('play vocal');
  const performInitName = 'vocal-play';
  const url = getSentenceArgByKey(sentence, 'vocal'); // 获取语音的url
  const volume = getSentenceArgByKey(sentence, 'volume'); // 获取语音的音量比
  let currentStageState: IStageState;
  currentStageState = webgalStore.getState().stage;
  let pos = '';
  let key = '';
  const freeFigure = currentStageState.freeFigure;
  const figureAssociatedAnimation = currentStageState.figureAssociatedAnimation;
  let bufferLength = 0;
  let currentMouthValue = 0;
  let audioLevel = 0;
  const lerpSpeed = 1;

  // 先停止之前的语音
  let VocalControl: any = document.getElementById('currentVocal');
  WebGAL.gameplay.performController.unmountPerform('vocal-play', true);
  if (VocalControl !== null) {
    VocalControl.currentTime = 0;
    VocalControl.pause();
  }

  for (const e of sentence.args) {
    if (e.key === 'left' && e.value === true) {
      pos = 'left';
    }
    if (e.key === 'right' && e.value === true) {
      pos = 'right';
    }
    if (e.key === 'center' && e.value === true) {
      pos = 'center';
    }
    if (e.key === 'figureId') {
      key = `${e.value.toString()}`;
    }
  }

  // 获得舞台状态
  webgalStore.dispatch(setStage({ key: 'vocal', value: url }));

  let isOver = false;
  return {
    arrangePerformPromise: new Promise((resolve) => {
      // 播放语音
      setTimeout(() => {
        let VocalControl: any = document.getElementById('currentVocal');
        // 设置语音音量
        typeof volume === 'number' && volume >= 0 && volume <= 100
          ? webgalStore.dispatch(setStage({ key: 'vocalVolume', value: volume }))
          : webgalStore.dispatch(setStage({ key: 'vocalVolume', value: 100 }));
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
              // 演出已经结束了，所以不用播放语音了
              VocalControl.oncanplay = () => {};
              clearInterval(audioLevelInterval);
              VocalControl.pause();
            },
            blockingNext: () => false,
            blockingAuto: () => {
              return !isOver;
            },
            skipNextCollect: true,
            stopTimeout: undefined, // 暂时不用，后面会交给自动清除
          };
          WebGAL.gameplay.performController.arrangeNewPerform(perform, sentence, false);
          VocalControl.oncanplay = () => {
            key = key ? key : `fig-${pos}`;
            const animationItem = figureAssociatedAnimation.find((tid) => tid.targetId === key);
            if (animationItem) {
              let maxAudioLevel = 0;
              let OPEN_THRESHOLD = 25;
              let HALF_OPEN_THRESHOLD = 20;

              const foundFigure = freeFigure.find((figure) => figure.key === key);

              if (foundFigure) {
                pos = foundFigure.basePosition;
              }

              if (!audioContext) {
                let audioContext: AudioContext | null = null;
                audioContext = new AudioContext();
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                dataArray = new Uint8Array(analyser.frequencyBinCount);
              }

              if (!analyser) {
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
              }

              bufferLength = analyser.frequencyBinCount;
              dataArray = new Uint8Array(bufferLength);
              let vocalControl = document.getElementById('currentVocal') as HTMLMediaElement;

              if (!source) {
                source = audioContext.createMediaElementSource(vocalControl);
                source.connect(analyser);
              }

              analyser.connect(audioContext.destination);

              function getAudioLevel(): number {
                if (!analyser || !dataArray) {
                  return 0;
                }
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                  sum += dataArray[i];
                }
                return sum / bufferLength;
              }

              function updateThresholds() {
                if (audioLevel > maxAudioLevel) {
                  maxAudioLevel = audioLevel;
                }
                OPEN_THRESHOLD = maxAudioLevel * 0.75;
                HALF_OPEN_THRESHOLD = maxAudioLevel * 0.5;
              }

              // Lip-snc Animation
              audioLevelInterval = setInterval(() => {
                audioLevel = getAudioLevel();
                if (audioLevel) {
                  updateThresholds();

                  let targetValue;
                  if (audioLevel > OPEN_THRESHOLD) {
                    targetValue = 1; // open
                  } else if (audioLevel > HALF_OPEN_THRESHOLD) {
                    targetValue = 0.5; // half_open
                  } else {
                    targetValue = 0; // closed
                  }
                  // Lerp
                  currentMouthValue = currentMouthValue + (targetValue - currentMouthValue) * lerpSpeed;

                  let mouthState;
                  if (currentMouthValue > 0.75) {
                    mouthState = 'open';
                  } else if (currentMouthValue > 0.25) {
                    mouthState = 'half_open';
                  } else {
                    mouthState = 'closed';
                  }
                  if (animationItem !== undefined) {
                    WebGAL.gameplay.pixiStage?.performMouthSyncAnimation(key, animationItem, mouthState, pos);
                  }
                }
              }, 100);

              // blinkAnimation
              let isBlinking = false;
              let blinkTimerID: any = null;
              let animationEndTime: any = null;

              function blinkAnimation() {
                if (isBlinking || (animationEndTime && Date.now() > animationEndTime)) return;
                if (animationItem !== undefined) {
                  isBlinking = true;
                  WebGAL.gameplay.pixiStage?.performBlinkAnimation(key, animationItem, 'closed', pos);
                  setTimeout(() => {
                    WebGAL.gameplay.pixiStage?.performBlinkAnimation(key, animationItem, 'open', pos);
                    isBlinking = false;
                    const nextBlinkTime = Math.random() * 300 + 3500;
                    setTimeout(blinkAnimation, nextBlinkTime);
                  }, 200);
                }
              }
              // 10sec
              animationEndTime = Date.now() + 10000;
              blinkAnimation();

              // 10sec
              setTimeout(() => {
                clearTimeout(blinkTimerID);
              }, 10000);
            }

            VocalControl?.play();
          };
          VocalControl.onended = () => {
            for (const e of WebGAL.gameplay.performController.performList) {
              if (e.performName === performInitName) {
                isOver = true;
                e.stopFunction();
                WebGAL.gameplay.performController.unmountPerform(e.performName);
              }
            }
            clearInterval(audioLevelInterval);
          };
        }
      }, 1);
    }),
  };
};
