import {FC} from "react";
import styles from './mainStage.module.scss'
import {useStore} from "reto";
import {TextBox} from "./TextBox/TextBox";
import {stageStateStore} from "../../Core/store/stage";

export const MainStage: FC = () => {
    const stageStore = useStore(stageStateStore);
    return <div className={styles.MainStage_main}>
        <div key={'bgMain'+stageStore.stageState.bg_Name}
            id={'MainStage_bg_MainContainer'}
             className={styles.MainStage_bgContainer_onChange} style={{
            backgroundImage: `url("${stageStore.stageState.bg_Name}")`,
            backgroundSize: "cover"
        }}/>
        <div key={'bgOld'+stageStore.stageState.oldBgName}
            className={styles.MainStage_oldBgContainer} style={{
            backgroundImage: `url("${stageStore.stageState.oldBgName}")`,
            backgroundSize: "cover"
        }}/>
        <TextBox/>
    </div>
}