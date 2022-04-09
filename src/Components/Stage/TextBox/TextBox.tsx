import {useStore} from "reto";
import {stageStateStore} from "../../../Core/store/stage";
import styles from './textbox.module.scss';
import {useEffect} from "react";

export const TextBox = () => {
    useEffect(() => {

    });
    const StageStore = useStore(stageStateStore);
    // 拆字
    const textArray: Array<string> = StageStore.stageState.showText.split('');
    const textElementList = textArray.map((e, index) => {
        return <span className={styles.TextBox_textElement_start}
                     key={index + 'textElement' + e + StageStore.stageState.showText}
                     style={{animationDelay: String(index * 35) + 'ms'}}>{e}</span>;
    });
    return <div id="textBoxMain" className={styles.TextBox_main}>
        {StageStore.stageState.showName !== '' &&
            <div className={styles.TextBox_showName}>{StageStore.stageState.showName}</div>}
        <div>
            {textElementList}
        </div>
    </div>;

};