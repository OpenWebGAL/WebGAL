import { logger } from '../../util/logger';
import { webgalStore } from '@/store/store';

/**
 * 设置音量
 */
export const setVolume = () => {
  const userDataState = webgalStore.getState().userData;
  const mainVol = userDataState.optionData.volumeMain;
  const vocalVol = mainVol * 0.01 * userDataState.optionData.vocalVolume * 0.01;
  const bgmVol = mainVol * 0.01 * userDataState.optionData.bgmVolume * 0.01;
  logger.debug(`设置背景音量：${bgmVol},语音音量：${vocalVol}`);
  // const bgmElement: any = document.getElementById('currentBgm');
  // if (bgmElement) {
  //   bgmElement.volume = bgmVol.toString();
  // }
  // const vocalElement: any = document.getElementById('currentVocal');
  // if (vocalElement) {
  //   vocalElement.volume = vocalVol.toString();
  // }
};
