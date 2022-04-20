import {FC, useEffect} from "react";
import styles from './mainStage.module.scss';
import {useStore} from "reto";
import {TextBox} from "./TextBox/TextBox";
import {stageStateStore} from "../../Core/store/stage";
import {FigureContainer} from "./FigureContainer/FigureContainer";
import {EventHandler} from "./EventHandler/EventHandler";
import {GuiStateStore} from "../../Core/store/GUI";
import {FullScreenPerform} from "./FullScreenPerform/FullScreenPerform";
import {nextSentence} from "../../Core/controller/gamePlay/nextSentence";
import {stopAll} from "../../Core/controller/gamePlay/fastSkip";
import {IEffect} from "@/Core/interface/stateInterface/stageInterface";

export const MainStage: FC = () => {
    const stageStore = useStore(stageStateStore);
    const GuiState = useStore(GuiStateStore);
    useEffect(() => {
        const effectList: Array<IEffect> = stageStore.stageState.effects;

        // 设置效果
        setTimeout(() => {
            // const bg = document.getElementById('MainStage_bg_MainContainer');
            effectList.forEach(effect => {
                const target = document.getElementById(effect.target);
                if (target) {
                    if (effect.filter !== '') {
                        target.style.filter = effect.filter;
                    }
                    if (effect.transform !== '') {
                        target.style.transform = effect.transform;
                    }
                }
            });
            // if (stageStore.stageState.bgTransform !== '') {
            //     if(bg){
            //         bg.style.transform = stageStore.stageState.bgTransform;
            //     }
            // }
            // if (stageStore.stageState.bgFilter !== '') {
            //     if(bg){
            //         bg.style.filter= stageStore.stageState.bgFilter;
            //     }
            // }
        }, 100);
    });
    return <div className={styles.MainStage_main}>
        <div key={'bgOld' + stageStore.stageState.oldBgName}
             id="MainStage_bg_OldContainer"
             className={styles.MainStage_oldBgContainer} style={{
            backgroundImage: `url("${stageStore.stageState.oldBgName}")`,
            backgroundSize: "cover"
        }}/>
        <div key={'bgMain' + stageStore.stageState.bgName}
             id="MainStage_bg_MainContainer"
             className={styles.MainStage_bgContainer} style={{
            backgroundImage: `url("${stageStore.stageState.bgName}")`,
            backgroundSize: "cover"
        }}/>
        <FigureContainer/>
        {GuiState.GuiState.showTextBox && <TextBox/>}
        <EventHandler/>
        <FullScreenPerform/>
        <div onClick={() => {
            // 如果文本框没有显示，则显示文本框
            if(!GuiState.GuiState.showTextBox){
                GuiState.setVisibility('showTextBox',true);
                return;
            }
            stopAll();
            nextSentence();
        }} id="FullScreenClcck"
             style={{width: '100%', height: '100%', position: "absolute", zIndex: '12', top: '0'}}/>
    </div>;
};
