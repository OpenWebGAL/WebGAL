import {ISentence} from "../../../interface/scene";
import {getRef} from "../../../store/storeRef";
import {IPerform} from "../../../interface/perform";
import styles from '../../../../Components/Stage/TextBox/textbox.module.scss'

export const say = (sentence: ISentence): IPerform => {
    const stageStore: any = getRef('stageRef');
    stageStore.setStage('showText', sentence.content);
    const performInitName: string = Math.random().toString();
    return {
        performName: performInitName,
        duration: sentence.content.length * 35 + 1500,
        isOver: false,
        isHoldOn: false,
        stopFunction: () => {
            const textElements = document.querySelectorAll('.' + styles.TextBox_textElement);
            const textArray = [...textElements];
            textArray.forEach(e => {
                e.className = styles.TextBox_textElement_Settled;
            })
        },
        blockingNext: () => false,
        blockingAuto: () => true,
        stopTimeout: undefined,//暂时不用，后面会交给自动清除
    };
}