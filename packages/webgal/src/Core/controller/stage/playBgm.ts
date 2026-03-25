import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { logger } from '@/Core/util/logger';
import { bgmManager } from '@/Core/Modules/audio/bgmManager';

/**
 * 播放bgm
 * @param url bgm路径
 * @param enter 淡入时间（单位毫秒）
 * @param volume 背景音乐 音量调整（0 - 100）
 */
export function playBgm(url: string, enter = 0, volume = 100): void {
  logger.debug('playing bgm' + url);
  if (url === '') {
    bgmManager.stop({ fade: enter });
    const lastSrc = webgalStore.getState().stage.bgm.src;
    webgalStore.dispatch(setStage({ key: 'bgm', value: { src: lastSrc, enter: -enter, volume: volume } }));
  } else {
    webgalStore.dispatch(setStage({ key: 'bgm', value: { src: url, enter: enter, volume: volume } }));
  }
  bgmManager.play({ src: url, volume: volume / 100, fade: enter });
}
