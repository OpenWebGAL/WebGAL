import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useEffect } from 'react';
import { logger } from '@/Core/util/etc/logger';

export const AudioContainer = () => {
  const stageStore = useSelector((webgalStore: RootState) => webgalStore.stage);
  const titleBgm = useSelector((webgalStore: RootState) => webgalStore.GUI.titleBgm);
  const isShowTitle = useSelector((webgalStore: RootState) => webgalStore.GUI.showTitle);
  const userDataState = useSelector((state: RootState) => state.userData);
  const mainVol = userDataState.optionData.volumeMain;
  const vocalVol = mainVol * 0.01 * userDataState.optionData.vocalVolume * 0.01;
  const bgmVol = mainVol * 0.01 * userDataState.optionData.bgmVolume * 0.01;
  const isEnterGame = useSelector((state: RootState) => state.GUI.isEnterGame);

  /**
   * 淡入BGM
   * @param bgm 背景音乐
   * @param maxVol 最大音量
   * @param time 淡入时间
   */
  const bgmFadeIn = (bgm: HTMLAudioElement, maxVol: number, time: number) => {
    // 设置音量为0（静音）
    time >= 0 ? (bgm.volume = 0) : (bgm.volume = maxVol);
    // 设置音量递增时间间隔
    const duration = 10;
    // 计算每duration的音量增加值（淡入效果）
    const volumeStep = (maxVol / time) * duration;
    // 每隔duration毫秒递增音量
    const fadeInInterval = setInterval(() => {
      if (bgm.volume + volumeStep >= maxVol) {
        // 如果音量接近或达到最大值，则设置最终音量
        bgm.volume = maxVol;
        clearInterval(fadeInInterval);
      } else if (bgm.volume + volumeStep <= 0) {
        // 如果音量接近或达到最小值，则设置最终音量
        bgm.volume = 0;
        clearInterval(fadeInInterval);
      } else {
        // 否则增加音量
        bgm.volume += volumeStep;
      }
    }, duration);
  };

  useEffect(() => {
    logger.debug(`设置背景音量：${bgmVol},语音音量：${vocalVol}`);
    const bgmElement = document.getElementById('currentBgm') as HTMLAudioElement;
    if (bgmElement) {
      stageStore.bgmEnter === 0 ? (bgmElement.volume = bgmVol) : bgmFadeIn(bgmElement, bgmVol, stageStore.bgmEnter);
    }
    const vocalElement: any = document.getElementById('currentVocal');
    if (vocalElement) {
      vocalElement.volume = vocalVol.toString();
    }
  }, [isShowTitle, titleBgm, stageStore.bgm, stageStore.bgmEnter, vocalVol, bgmVol]);
  return (
    <div>
      <audio
        key={isShowTitle.toString() + titleBgm}
        id="currentBgm"
        src={isShowTitle ? titleBgm : stageStore.bgm}
        loop={true}
        autoPlay={isEnterGame}
      />
      <audio id="currentVocal" src={stageStore.vocal} />
    </div>
  );
};
