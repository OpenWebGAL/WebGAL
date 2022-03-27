import {useStore} from "reto";
import {stageStateStore} from "../../../Core/store/stage";
import styles from './textbox.module.scss'
import {nextSentence} from "../../../Core/controller/gamePlay/nextSentence";

export const TextBox = () => {
    const StageStore = useStore(stageStateStore);
    //拆字
    const textArray: Array<string> = StageStore.stageState.showText.split('');
    const textElementList = textArray.map((e, index) => {
        return <span className={styles.TextBox_textElement_Settled}
                     key={index + 'textElement' + e}
                     style={{animationDelay: '' + index * 35 + 'ms'}}>{e}</span>;
    })
    return <div id={'textBoxMain'} className={styles.TextBox_main} onClick={nextSentence}>
        {textElementList}
    </div>
}