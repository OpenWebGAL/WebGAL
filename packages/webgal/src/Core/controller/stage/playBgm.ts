import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { logger } from '@/Core/util/etc/logger';

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

/**
 * 播放bgm
 * @param url bgm路径
 * @param enter 淡入时间（单位毫秒）
 */
export function playBgm(url: string, enter = 0): void {
  logger.info('playing bgm' + url);
  if (url === '') {
    setTimeout(() => {
      webgalStore.dispatch(setStage({ key: 'bgm', value: '' }));
    }, enter);
    webgalStore.dispatch(setStage({ key: 'bgmEnter', value: -enter }));
  } else {
    webgalStore.dispatch(setStage({ key: 'bgm', value: url }));
    webgalStore.dispatch(setStage({ key: 'bgmEnter', value: enter }));
  }
  const audioElement = document.getElementById('currentBgm') as HTMLAudioElement;
  audioElement?.play();
}
