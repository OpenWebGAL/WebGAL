import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import { logger } from '@/Core/util/etc/logger';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { PerformController } from '@/Core/controller/perform/performController';

/**
 * 播放一段语音
 * @param sentence 语句
 */
export const playVocal = (sentence: ISentence) => {
  logger.debug('单次播放语音');
  const performInitName = 'vocal-play';
  let url = ''; // 获取语音的url
  for (const e of sentence.args) {
    if (e.key === 'vocal') {
      url = e.value.toString();
    }
  }
  // 先停止之前的语音
  let VocalControl: any = document.getElementById('currentVocal');
  PerformController.unmountPerform('vocal-play', true);
  if (VocalControl !== null) {
    VocalControl.currentTime = 0;
    VocalControl.pause();
  }
  // 获得舞台状态
  webgalStore.dispatch(setStage({ key: 'vocal', value: url }));
  return {
    arrangePerformPromise: new Promise((resolve) => {
      // 播放语音
      setTimeout(() => {
        let VocalControl: any = document.getElementById('currentVocal');
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
              VocalControl.pause();
            },
            blockingNext: () => false,
            blockingAuto: () => true,
            skipNextCollect: true,
            stopTimeout: undefined, // 暂时不用，后面会交给自动清除
          };
          PerformController.arrangeNewPerform(perform, sentence, false);
          VocalControl.oncanplay = () => {
            VocalControl.play();
          };
          VocalControl.onended = () => {
            for (const e of RUNTIME_GAMEPLAY.performList) {
              if (e.performName === performInitName) {
                e.isOver = true;
                e.stopFunction();
                PerformController.unmountPerform(e.performName);
              }
            }
          };
        }
      }, 1);
    }),
  };
};
