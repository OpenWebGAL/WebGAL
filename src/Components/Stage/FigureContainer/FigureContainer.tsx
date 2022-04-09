import styles from './figureContainer.module.scss';
import {useStore} from "reto";
import {stageStateStore} from "../../../Core/store/stage";

export const FigureContainer = () => {
    const stageStore = useStore(stageStateStore);
    return <div className={styles.FigureContainer_main}>
        <div className={styles.figContainerLeft + ' ' + styles.figContainer} id="figLeftContainer">
            {stageStore.stageState.figNameLeft !== '' &&
                <img className={styles.figurePic} src={stageStore.stageState.figNameLeft} alt="fig_left"/>}
        </div>
        <div className={styles.figContainerCenter + ' ' + styles.figContainer} id="figCenterContainer">
            {stageStore.stageState.figName !== '' &&
                <img src={stageStore.stageState.figName} alt="fig_center"/>}
        </div>
        <div className={styles.figContainerRight + ' ' + styles.figContainer} id="figRightContainer">
            {stageStore.stageState.figNameRight !== '' &&
                <img src={stageStore.stageState.figNameRight} alt="fig_right"/>}
        </div>
    </div>;
};