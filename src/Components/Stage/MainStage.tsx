import {FC} from "react";
import styles from './mainStage.module.scss'
import {useStore} from "reto";
import {TextBox} from "./TextBox/TextBox";
import {stageStateStore} from "../../Core/store/stage"
import {FigureContainer} from "./FigureContainer/FigureContainer";
import {EventHandler} from "./EventHandler/EventHandler";
import {GuiStateStore} from "../../Core/store/GUI";

export const MainStage: FC = () => {
    const stageStore = useStore(stageStateStore);
    const GuiState = useStore(GuiStateStore)
    return <div className={styles.MainStage_main}>
        <div key={'bgMain' + stageStore.stageState.bgName}
             id={'MainStage_bg_MainContainer'}
             className={styles.MainStage_bgContainer_onChange} style={{
            backgroundImage: `url("${stageStore.stageState.bgName}")`,
            backgroundSize: "cover"
        }}/>
        <div key={'bgOld' + stageStore.stageState.oldBgName}
             id={'MainStage_bg_OldContainer'}
             className={styles.MainStage_oldBgContainer} style={{
            backgroundImage: `url("${stageStore.stageState.oldBgName}")`,
            backgroundSize: "cover"
        }}/>
        <FigureContainer/>
        {GuiState.GuiState.showTextBox && <TextBox/>}
        <EventHandler/>
    </div>
}