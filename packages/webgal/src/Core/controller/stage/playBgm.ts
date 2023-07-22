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
 */
export function playBgm(url: string): void {
  logger.info('playing bgm' + url);
  webgalStore.dispatch(setStage({ key: 'bgm', value: url }));
  const audioElement = document.getElementById('currentBgm') as HTMLAudioElement;
  audioElement?.play();
}
