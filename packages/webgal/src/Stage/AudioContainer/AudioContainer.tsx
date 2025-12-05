import { useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { useEffect, useState } from 'react';
import { logger } from '@/Core/util/logger';

export const AudioContainer = () => {
  const stageStore = useSelector((webgalStore: RootState) => webgalStore.stage);
  const titleBgm = useSelector((webgalStore: RootState) => webgalStore.GUI.titleBgm);
  const isShowTitle = useSelector((webgalStore: RootState) => webgalStore.GUI.showTitle);
  const userDataState = useSelector((state: RootState) => state.userData);
  const mainVol = userDataState.optionData.volumeMain;
  const vocalVol = mainVol * 0.01 * userDataState.optionData.vocalVolume * 0.01 * stageStore.vocalVolume * 0.01;
  const bgmVol = mainVol * 0.01 * userDataState.optionData.bgmVolume * 0.01 * stageStore.bgm.volume * 0.01;
  const bgmEnter = stageStore.bgm.enter;
  const uiSoundEffects = stageStore.uiSe;
  const seVol = mainVol * 0.01 * (userDataState.optionData?.seVolume ?? 100) * 0.01;
  const uiSeVol = mainVol * 0.01 * (userDataState.optionData.uiSeVolume ?? 50) * 0.01;
  const isEnterGame = useSelector((state: RootState) => state.GUI.isEnterGame);

  // 淡入淡出定时器
  const [fadeTimer, setFadeTimer] = useState(setTimeout(() => {}, 0));

  /**
   * 淡入BGM
   * @param bgm 背景音乐
   * @param maxVol 最大音量
   * @param time 淡入时间
   */
  const bgmFadeIn = (bgm: HTMLAudioElement, maxVol: number, time: number) => {
    // 设置初始音量
    time >= 0 ? (bgm.volume = 0) : (bgm.volume = maxVol);
    // 设置音量递增时间间隔
    const duration = 10;
    // 计算每duration的音量增量
    const volumeStep = (maxVol / time) * duration;
    // 基于递归调用实现淡入淡出效果
    const fade = () => {
      const timer = setTimeout(() => {
        if (bgm.volume + volumeStep >= maxVol) {
          // 如果音量接近或达到最大值，则设置最终音量（淡入）
          bgm.volume = maxVol;
        } else if (bgm.volume + volumeStep <= 0) {
          // 如果音量接近或达到最小值，则设置最终音量（淡出）
          bgm.volume = 0;
          // 淡出效果结束后，将 bgm 置空
          webgalStore.dispatch(setStage({ key: 'bgm', value: { src: '', enter: 0, volume: 100 } }));
        } else {
          // 否则增加音量，并递归调用
          bgm.volume += volumeStep;
          fade();
        }
      }, duration);
      // 将定时器引用存储到 fadeTimer 中
      setFadeTimer(timer);
    };
    // 调用淡入淡出函数
    fade();
  };

  useEffect(() => {
    // 清除之前的淡入淡出定时器
    clearTimeout(fadeTimer);
    // 获取当前背景音乐元素
    const bgmElement = document.getElementById('currentBgm') as HTMLAudioElement;
    // 如果当前背景音乐元素存在，则淡入淡出
    if (bgmElement) {
      bgmEnter === 0 ? (bgmElement.volume = bgmVol) : bgmFadeIn(bgmElement, bgmVol, bgmEnter);
    }
  }, [isShowTitle, titleBgm, stageStore.bgm.src, bgmVol, bgmEnter]);

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
      uiSeAudioElement.volume = isNaN(seVol) ? mainVol / 100 : seVol / 100;
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
        src={isShowTitle ? titleBgm : stageStore.bgm.src}
        loop={true}
        autoPlay={isEnterGame}
      />
      <audio key={stageStore.playVocal} id="currentVocal" src={stageStore.playVocal} />
    </div>
  );
};
