import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/controller/perform/performInterface';
import React from 'react';
import ReactDOM from 'react-dom';
import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import { unmountPerform } from '@/Core/controller/perform/unmountPerform';
import { getRandomPerformName } from '@/Core/controller/perform/getRandomPerformName';
import styles from '../../Components/Stage/FullScreenPerform/fullScreenPerform.module.scss';
import { webgalStore } from '@/store/store';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';

/**
 * 播放一段视频
 * @param sentence
 */
export const playVideo = (sentence: ISentence): IPerform => {
  const performInitName: string = getRandomPerformName();
  ReactDOM.render(
    <div className={styles.videoContainer}>
      <video className={styles.fullScreen_video} id="playVideoElement" src={sentence.content} autoPlay={true} />
    </div>,
    document.getElementById('videoContainer'),
  );

  return {
    performName: 'none',
    duration: 0,
    isOver: false,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
    arrangePerformPromise: new Promise<IPerform>((resolve) => {
      /**
       * 启动视频播放
       */
      setTimeout(() => {
        let VocalControl: any = document.getElementById('playVideoElement');
        if (VocalControl !== null) {
          VocalControl.currentTime = 0;
          // 播放并作为一个特别演出加入
          const perform = {
            performName: performInitName,
            duration: 1000 * 60 * 60,
            isOver: false,
            isHoldOn: false,
            stopFunction: () => {
              /**
               * 不要播放视频了，因为演出已经没有了。
               */
              VocalControl.oncanplay = () => {};
              /**
               * 恢复音量
               */
              const userDataState = webgalStore.getState().userData;
              const mainVol = userDataState.optionData.volumeMain;
              const vocalVol = mainVol * 0.01 * userDataState.optionData.vocalVolume * 0.01;
              const bgmVol = mainVol * 0.01 * userDataState.optionData.bgmVolume * 0.01;
              const bgmElement: any = document.getElementById('currentBgm');
              if (bgmElement) {
                bgmElement.volume = bgmVol.toString();
              }
              const vocalElement: any = document.getElementById('currentVocal');
              if (bgmElement) {
                vocalElement.volume = vocalVol.toString();
              }
              ReactDOM.render(<div />, document.getElementById('videoContainer'));
            },
            blockingNext: () => false,
            blockingAuto: () => true,
            stopTimeout: undefined, // 暂时不用，后面会交给自动清除
            goNextWhenOver: true,
          };
          resolve(perform);
          VocalControl.oncanplay = () => {
            /**
             * 把bgm和语音的音量设为0
             */
            const vocalVol = 0;
            const bgmVol = 0;
            const bgmElement: any = document.getElementById('currentBgm');
            if (bgmElement) {
              bgmElement.volume = bgmVol.toString();
            }
            const vocalElement: any = document.getElementById('currentVocal');
            if (bgmElement) {
              vocalElement.volume = vocalVol.toString();
            }

            VocalControl.play();
          };
          VocalControl.onended = () => {
            for (const e of RUNTIME_GAMEPLAY.performList) {
              if (e.performName === performInitName) {
                e.isOver = true;
                e.stopFunction();
                unmountPerform(e.performName);
                nextSentence();
              }
            }
          };
        }
      }, 1);
    }),
  };
};
