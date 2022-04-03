import {useStore} from "reto";
import {stageStateStore} from "../../../Core/store/stage";
import styles from './textbox.module.scss'
import {nextSentence} from "../../../Core/controller/gamePlay/nextSentence";
import {useEffect} from "react";
import {stopAll} from "../../../Core/controller/gamePlay/fastSkip";

export const TextBox = () => {
    useEffect(() => {

    })
    const StageStore = useStore(stageStateStore);
    //拆字
    const textArray: Array<string> = StageStore.stageState.showText.split('');
    const textElementList = textArray.map((e, index) => {
        return <span className={styles.TextBox_textElement_start}
                     key={index + 'textElement' + e + StageStore.stageState.showText}
                     style={{animationDelay: '' + index * 35 + 'ms'}}>{e}</span>;
    })
    return <div id={'textBoxMain'} className={styles.TextBox_main} onClick={() => {
        stopAll();
        nextSentence();
    }}>
        {StageStore.stageState.showName !== '' &&
            <div className={styles.TextBox_showName}>{StageStore.stageState.showName}</div>}
        <div>
            {textElementList}
        </div>
    </div>
}