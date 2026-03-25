import { useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { useEffect, useState } from 'react';
import { logger } from '@/Core/util/logger';
import { bgmManager } from '@/Core/Modules/audio/bgmManager';

export const AudioContainer = () => {
  const stageStore = useSelector((webgalStore: RootState) => webgalStore.stage);
  const titleBgm = useSelector((webgalStore: RootState) => webgalStore.GUI.titleBgm);
  const isShowTitle = useSelector((webgalStore: RootState) => webgalStore.GUI.showTitle);
  const userDataState = useSelector((state: RootState) => state.userData);
  const mainVol = userDataState.optionData.volumeMain;
  const vocalBaseVol = mainVol * 0.01 * userDataState.optionData.vocalVolume * 0.01;
  const vocalVol = vocalBaseVol * stageStore.vocalVolume * 0.01;
  const bgmVol = mainVol * 0.01 * userDataState.optionData.bgmVolume * 0.01 * stageStore.bgm.volume * 0.01;
  const bgmEnter = stageStore.bgm.enter;
  const uiSoundEffects = stageStore.uiSe;
  const seVol = mainVol * 0.01 * (userDataState.optionData?.seVolume ?? 100) * 0.01;
  const uiSeVol = mainVol * 0.01 * (userDataState.optionData.uiSeVolume ?? 50) * 0.01;
  const isEnterGame = useSelector((state: RootState) => state.GUI.isEnterGame);

  useEffect(() => {
    if (!isEnterGame) return;

    if (isShowTitle) {
      bgmManager.play({ src: titleBgm, volume: bgmVol, fade: bgmEnter });
    } else {
      bgmManager.play({ src: stageStore.bgm.src, volume: bgmVol, fade: bgmEnter });
    }
  }, [isEnterGame, isShowTitle, titleBgm, stageStore.bgm.src]);

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
  }, [vocalVol, stageStore.playVocal]);

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
      <audio key={stageStore.playVocal} id="currentVocal" src={stageStore.playVocal} />
    </div>
  );
};
