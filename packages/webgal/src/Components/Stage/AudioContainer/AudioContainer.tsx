import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export const AudioContainer = () => {
  const stageStore = useSelector((webgalStore: RootState) => webgalStore.stage);
  const titleBgm = useSelector((webgalStore: RootState) => webgalStore.GUI.titleBgm);
  const isShowTitle = useSelector((webgalStore: RootState) => webgalStore.GUI.showTitle);

  return (
    <div>
      <audio id="currentBgm" src={isShowTitle ? titleBgm : stageStore.bgm} loop={true} autoPlay={true} />
      <audio id="currentVocal" src={stageStore.vocal} />
    </div>
  );
};
