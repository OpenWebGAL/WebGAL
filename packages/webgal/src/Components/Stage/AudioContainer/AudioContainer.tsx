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
  useEffect(() => {
    logger.debug(`设置背景音量：${bgmVol},语音音量：${vocalVol}`);
    const bgmElement: any = document.getElementById('currentBgm');
    if (bgmElement) {
      bgmElement.volume = bgmVol.toString();
    }
    const vocalElement: any = document.getElementById('currentVocal');
    if (vocalElement) {
      vocalElement.volume = vocalVol.toString();
    }
  }, [isShowTitle, titleBgm, stageStore.bgm, vocalVol, bgmVol]);
  return (
    <div>
      <audio
        key={isShowTitle.toString() + titleBgm}
        id="currentBgm"
        src={isShowTitle ? titleBgm : stageStore.bgm}
        loop={true}
        autoPlay={true}
      />
      <audio id="currentVocal" src={stageStore.vocal} />
    </div>
  );
};
