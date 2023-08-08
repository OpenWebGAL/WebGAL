import { useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { useEffect } from 'react';
import { logger } from '@/Core/util/etc/logger';

export const AudioContainer = () => {
  const stageStore = useSelector((webgalStore: RootState) => webgalStore.stage);
  const titleBgm = useSelector((webgalStore: RootState) => webgalStore.GUI.titleBgm);
  const isShowTitle = useSelector((webgalStore: RootState) => webgalStore.GUI.showTitle);
  const userDataState = useSelector((state: RootState) => state.userData);
  const mainVol = userDataState.optionData.volumeMain;
  const vocalVol = mainVol * 0.01 * userDataState.optionData.vocalVolume * 0.01 * stageStore.vocalVolume * 0.01;
  const bgmVol = mainVol * 0.01 * userDataState.optionData.bgmVolume * 0.01 * stageStore.bgmVolume * 0.01;
  const bgmEnter = stageStore.bgmEnter;
  const uiSoundEffects = stageStore.uiSe;
  const seVol = mainVol * 0.01 * userDataState.optionData.seVolume * 0.01;
  const uiSeVol =
    mainVol * 0.01 * userDataState.optionData.seVolume * 0.01 * userDataState.optionData.uiSeVolume * 0.01;
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
    const bgmElement = document.getElementById('currentBgm') as HTMLAudioElement;
    if (bgmElement) {
      bgmEnter === 0 ? (bgmElement.volume = bgmVol) : bgmFadeIn(bgmElement, bgmVol, bgmEnter);
    }
  }, [isShowTitle, titleBgm, stageStore.bgm, bgmVol, bgmEnter]);

  useEffect(() => {
    logger.debug(`设置背景音量：${bgmVol}`);
  }, [bgmVol]);

  useEffect(() => {
    logger.debug(`设置背景音量淡入时间: ${bgmEnter}`);
  }, [bgmEnter]);

  useEffect(() => {
    logger.debug(`设置语音音量：${vocalVol}`);
    const vocalElement: any = document.getElementById('currentVocal');
    if (vocalElement) {
      vocalElement.volume = vocalVol.toString();
    }
  }, [vocalVol]);

  useEffect(() => {
    if (uiSoundEffects === '') return;
    const uiSeAudioElement = document.createElement('audio');
    uiSeAudioElement.src = uiSoundEffects;
    uiSeAudioElement.loop = false;
    // 设置音量
    if (!isNaN(uiSeVol)) {
      uiSeAudioElement.volume = uiSeVol;
    } else {
      // 针对原来使用 WebGAL version <= 4.4.2 的用户数据中不存在UI音效音量的情况
      logger.error('UI SE Vol is NaN');
      uiSeAudioElement.volume = isNaN(seVol) ? mainVol/ 100 : seVol/ 100;
    }
    // 播放UI音效
    uiSeAudioElement.play();
    uiSeAudioElement.addEventListener('ended', () => {
      // Processing after sound effects are played
      uiSeAudioElement.remove();
    });
    webgalStore.dispatch(setStage({ key: 'uiSe', value: '' }));
  }, [uiSoundEffects]);

  useEffect(() => {
    logger.debug(`设置音效音量: ${seVol}`);
  }, [seVol]);

  useEffect(() => {
    logger.debug(`设置用户界面音效音量: ${uiSeVol}`);
  }, [uiSeVol]);

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
