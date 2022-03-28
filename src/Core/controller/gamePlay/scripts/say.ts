import {ISentence} from "../../../interface/scene";
import {getRef} from "../../../store/storeRef";
import {IPerform} from "../../../interface/perform";
import styles from '../../../../Components/Stage/TextBox/textbox.module.scss'
import {getRandomPerformName} from "../../../util/getRandomPerformName";
import {playVocal} from "./playVocal";


/**
 * 进行普通对话的显示
 * @param sentence 语句
 * @return {IPerform} 执行的演出
 */
export const say = (sentence: ISentence): IPerform => {
    const stageStore: any = getRef('stageRef');
    //设置文本显示
    stageStore.setStage('showText', sentence.content);
    //设置显示的角色名称
    let showName = stageStore.stageState.showName;//先默认继承
    for (const e of sentence.args) {
        if (e.key === 'speaker') {
            showName = e.value;
        }
        if (e.key === 'clear' && e.value === true) {
            showName = '';
        }
        if(e.key === 'vocal'){
            playVocal(sentence);
        }
    }
    stageStore.setStage('showName', showName);
    setTimeout(() => {
        const textElements = document.querySelectorAll('.' + styles.TextBox_textElement_Settled);
        const textArray = [...textElements];
        textArray.forEach(e => {
            e.className = styles.TextBox_textElement;
        })
    }, 0);
    const performInitName: string = getRandomPerformName();
    return {
        performName: performInitName,
        duration: sentence.content.length * 35 + 100,
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