import {ISentence} from "../../../interface/scene";
import {IPerform} from "../../../interface/perform";
import {getRandomPerformName} from "../../../util/getRandomPerformName";
import styles from '../../../../Components/Stage/mainStage.module.scss'
import {getRef} from "../../../store/storeRef";

export const changeBg = (sentence: ISentence): IPerform => {
    const oldBgName = getRef('stageRef').stageState.bg_Name;
    getRef('stageRef').setStage('oldBgName', oldBgName); //改变旧背景，使其渐变消失
    getRef('stageRef').setStage('bgName', sentence.content);//改变新背景，使其呈现
    const performInitName: string = getRandomPerformName();
    return {
        performName: performInitName,
        duration: 3000,
        isOver: false,
        isHoldOn: false,
        stopFunction: () => {
            const bgContainer = document.getElementById('MainStage_bg_MainContainer');
            if (bgContainer)
                bgContainer.className = styles.MainStage_bgContainer;
        },
        blockingNext: () => false,
        blockingAuto: () => true,
        stopTimeout: undefined,//暂时不用，后面会交给自动清除
    };
}