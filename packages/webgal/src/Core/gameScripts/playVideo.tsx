import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import React from 'react';
import ReactDOM from 'react-dom';
import styles from '@/Stage/FullScreenPerform/fullScreenPerform.module.scss';
import { webgalStore } from '@/store/store';
import { getRandomPerformName } from '@/Core/Modules/perform/performController';
import { getBooleanArgByKey } from '@/Core/util/getSentenceArg';
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

  let blockingNextFlag = getBooleanArgByKey(sentence, 'skipOff') ?? false;
  let isOver = false;
  let skipVideo = () => {};
  const restoreVolumeAndUnmount = () => {
    WebGAL.events.fullscreenDbClick.off(skipVideo);
    /**
     * 恢复音量
     */
    const bgmElement: any = document.getElementById('currentBgm');
    if (bgmElement) {
      bgmElement.volume = bgmVol.toString();
    }
    const vocalElement: any = document.getElementById('currentVocal');
    if (vocalElement) {
      vocalElement.volume = vocalVol.toString();
    }
    // eslint-disable-next-line react/no-deprecated
    ReactDOM.render(<div />, document.getElementById('videoContainer'));
  };
  const endPerform = () => {
    isOver = true;
    WebGAL.gameplay.performController.unmountPerform(performInitName);
  };
  skipVideo = () => {
    endPerform();
  };
  return {
    performName: performInitName,
    duration: 1000 * 60 * 60,
    isHoldOn: false,
    startFunction: () => {
      // eslint-disable-next-line react/no-deprecated
      ReactDOM.render(
        <div className={styles.videoContainer}>
          <video className={styles.fullScreen_video} id="playVideoElement" src={sentence.content} autoPlay={true} />
        </div>,
        document.getElementById('videoContainer'),
      );
      /**
       * 启动视频播放
       */
      setTimeout(() => {
        let VocalControl: any = document.getElementById('playVideoElement');
        if (VocalControl !== null) {
          VocalControl.currentTime = 0;
          VocalControl.volume = bgmVol;
          // 双击可跳过视频
          WebGAL.events.fullscreenDbClick.on(skipVideo);
          /**
           * 把bgm和语音的音量设为0
           */
          const bgmElement: any = document.getElementById('currentBgm');
          if (bgmElement) {
            bgmElement.volume = '0';
          }
          const vocalElement: any = document.getElementById('currentVocal');
          if (vocalElement) {
            vocalElement.volume = '0';
          }

          VocalControl?.play().catch(() => {});

          VocalControl.onended = () => {
            endPerform();
          };
        }
      }, 1);
    },
    stopFunction: restoreVolumeAndUnmount,
    blockingNext: () => blockingNextFlag,
    blockingAuto: () => !isOver,
    goNextWhenOver: true,
  };
};
