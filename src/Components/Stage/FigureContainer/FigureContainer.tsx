import styles from './figureContainer.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export const FigureContainer = () => {
  const stageState = useSelector((state: RootState) => state.stage);
  return (
    <div className={styles.FigureContainer_main}>
      <div className={styles.figContainerLeft + ' ' + styles.figContainer} id="figLeftContainer">
        {stageState.figNameLeft !== '' && (
          <img className={styles.figurePic} src={stageState.figNameLeft} alt="fig_left" />
        )}
      </div>
      <div className={styles.figContainerCenter + ' ' + styles.figContainer} id="figCenterContainer">
        {stageState.figName !== '' && <img className={styles.figurePic} src={stageState.figName} alt="fig_center" />}
      </div>
      <div className={styles.figContainerRight + ' ' + styles.figContainer} id="figRightContainer">
        {stageState.figNameRight !== '' && (
          <img className={styles.figurePic} src={stageState.figNameRight} alt="fig_right" />
        )}
      </div>
    </div>
  );
};
