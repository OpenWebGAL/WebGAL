import styles from './fullScreenPerform.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export const FullScreenPerform = () => {
  const stageState = useSelector((state: RootState) => state.stage);
  let stageWidth = '100%';
  let stageHeight = '100%';
  let top = '0';
  if (stageState.enableFilm !== '') {
    stageHeight = '76%';
    top = '12%';
  }
  return (
    <div className={styles.FullScreenPerform_main} style={{ width: stageWidth, height: stageHeight, top: top }}>
      <div id="videoContainer" />
    </div>
  );
};
