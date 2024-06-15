import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { logger } from '@/Core/util/logger';

// /**
//  * 停止bgm
//  */
// export const eraseBgm = () => {
//   logger.debug(`停止bgm`);
//   // 停止之前的bgm
//   let VocalControl: any = document.getElementById('currentBgm');
//   if (VocalControl !== null) {
//     VocalControl.currentTime = 0;
//     if (!VocalControl.paused) VocalControl.pause();
//   }
//   // 获得舞台状态并设置
//   webgalStore.dispatch(setStage({key: 'bgm', value: ''}));
// };

let emptyBgmTimeout: ReturnType<typeof setTimeout>;

/**
 * 播放bgm
 * @param url bgm路径
 * @param enter 淡入时间（单位毫秒）
 * @param volume 背景音乐 音量调整（0 - 100）
 */
export function playBgm(url: string, enter = 0, volume = 100): void {
  logger.debug('playing bgm' + url);
  if (url === '') {
    emptyBgmTimeout = setTimeout(() => {
      // 淡入淡出效果结束后，将 bgm 置空
      webgalStore.dispatch(setStage({ key: 'bgm', value: { src: '', enter: 0, volume: 100 } }));
    }, enter);
    const lastSrc = webgalStore.getState().stage.bgm.src;
    webgalStore.dispatch(setStage({ key: 'bgm', value: { src: lastSrc, enter: -enter, volume: volume } }));
  } else {
    // 不要清除bgm了！
    clearTimeout(emptyBgmTimeout);
    webgalStore.dispatch(setStage({ key: 'bgm', value: { src: url, enter: enter, volume: volume } }));
  }
  const audioElement = document.getElementById('currentBgm') as HTMLAudioElement;
  if (audioElement.src) {
    audioElement?.play();
  }
}
