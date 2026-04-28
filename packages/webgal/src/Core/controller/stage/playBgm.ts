import { logger } from '@/Core/util/logger';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';

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
//   stageStateManager.setStage('bgm', '');
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
      stageStateManager.setStageAndCommit('bgm', { src: '', enter: 0, volume: 100 });
    }, enter);
    const lastSrc = stageStateManager.getCalculationStageState().bgm.src;
    stageStateManager.setStage('bgm', { src: lastSrc, enter: -enter, volume: volume });
  } else {
    // 不要清除bgm了！
    clearTimeout(emptyBgmTimeout);
    stageStateManager.setStage('bgm', { src: url, enter: enter, volume: volume });
  }
  setTimeout(() => {
    const audioElement = document.getElementById('currentBgm') as HTMLAudioElement;
    if (audioElement.src) {
      audioElement?.play();
    }
  }, 0);
}
