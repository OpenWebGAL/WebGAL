import {ISentence} from "../../../interface/scene";
import {storeRef} from "../../../store/storeRef";
import {runtime_gamePlay} from "../../../runtime/gamePlay";
import {IPerform} from "../../../interface/perform";
import styles from '../../../../Components/Stage/TextBox/textbox.module.scss'

export const say = (sentence: ISentence) => {
    console.log(sentence.content)
    if (storeRef.stageRef) {
        const stageStore: any = storeRef.stageRef.current;
        stageStore.setStage('showText', sentence.content);
    }
    const performInitName: string = Math.random().toString();
    const performController: IPerform = {
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
        stopTimeout: undefined
    }
    performController.stopTimeout = setTimeout(performController.stopFunction, performController.duration);
    runtime_gamePlay.performList.push(performController)
    console.log(runtime_gamePlay.performList)
}