import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import React from 'react';
import ReactDOM from 'react-dom';
import styles from '../../Components/Stage/FullScreenPerform/fullScreenPerform.module.scss';
import { webgalStore } from '@/store/store';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';
import { getRandomPerformName, PerformController } from '@/Core/Modules/perform/performController';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { WebGAL } from '@/Core/WebGAL';
/**
 * 播放一段视频 * @param sentence
 */
export const playVideo = (sentence: ISentence): IPerform => {
  const userDataState = webgalStore.getState().userData;
  const mainVol = userDataState.optionData.volumeMain;
  const vocalVol = mainVol * 0.01 * userDataState.optionData.vocalVolume * 0.01;
  const bgmVol = mainVol * 0.01 * userDataState.optionData.bgmVolume * 0.01;
  const performInitName: string = getRandomPerformName();

  let blockingNext = getSentenceArgByKey(sentence, 'skipOff');
  let blockingNextFlag = false;
  if (blockingNext) {
    blockingNextFlag = true;
  }

  ReactDOM.render(
    <div className={styles.videoContainer}>
      <video className={styles.fullScreen_video} id="playVideoElement" src={sentence.content} autoPlay={true} />
    </div>,
    document.getElementById('videoContainer'),
  );
  let isOver = false;
  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => blockingNextFlag,
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
          VocalControl.volume = bgmVol;
          const endPerform = () => {
            for (const e of WebGAL.gameplay.performController.performList) {
              if (e.performName === performInitName) {
                isOver = true;
                e.stopFunction();
                WebGAL.gameplay.performController.unmountPerform(e.performName);
                nextSentence();
              }
            }
          };
          const skipVideo = () => {
            endPerform();
          };
          // 双击可跳过视频
          WebGAL.eventBus.on('fullscreen-dbclick', () => {
            skipVideo();
          });
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
            blockingNext: () => blockingNextFlag,
            blockingAuto: () => {
              return !isOver;
            },
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

            VocalControl?.play();
          };
          VocalControl.onended = () => {
            endPerform();
          };
        }
      }, 1);
    }),
  };
};
