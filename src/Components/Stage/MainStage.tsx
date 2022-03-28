import {FC} from "react";
import styles from './mainStage.module.scss'
import {useStore} from "reto";
import {TextBox} from "./TextBox/TextBox";
import {stageStateStore} from "../../Core/store/stage"
import {FigureContainer} from "./FigureContainer/FigureContainer";
import {EventHandler} from "./EventHandler/EventHandler";

export const MainStage: FC = () => {
    const stageStore = useStore(stageStateStore);
    return <div className={styles.MainStage_main}>
        <div key={'bgMain' + stageStore.stageState.bgName}
             id={'MainStage_bg_MainContainer'}
             className={styles.MainStage_bgContainer_onChange} style={{
            backgroundImage: `url("${stageStore.stageState.bgName}")`,
            backgroundSize: "cover"
        }}/>
        <div key={'bgOld' + stageStore.stageState.oldBgName}
             className={styles.MainStage_oldBgContainer} style={{
            backgroundImage: `url("${stageStore.stageState.oldBgName}")`,
            backgroundSize: "cover"
        }}/>
        <FigureContainer/>
        <TextBox/>
        <EventHandler/>
    </div>
}