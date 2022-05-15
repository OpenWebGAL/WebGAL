import {logger} from './logger';
import {webgalStore} from "@/Core/store/store";
import {setStage} from "@/Core/store/stageReducer";

/**
 * 播放bgm的实际执行函数
 * @param url bgm的路径
 */
export const playBgm = (url: string) => {
  logger.debug(`播放bgm：${url}`);
  // 先停止之前的bgm
  let VocalControl: any = document.getElementById('currentBgm');
  if (VocalControl !== null) {
    VocalControl.currentTime = 0;
    if (!VocalControl.paused) VocalControl.pause();
  }
  // 获得舞台状态并设置
  webgalStore.dispatch(setStage({key: 'bgm', value: url}));
  // 播放语音
  setTimeout(() => {
    let VocalControl: any = document.getElementById('currentBgm');
    if (VocalControl !== null) {
      VocalControl.currentTime = 0;
      VocalControl.oncanplay = () => {
        VocalControl.play();
      };
    }
  }, 1);
};
