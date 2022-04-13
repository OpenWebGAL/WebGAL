import {useStore} from "reto";
import {stageStateStore} from "../../../Core/store/stage";
import styles from './textbox.module.scss';
import {useEffect} from "react";
import {userDataStateStore} from "../../../Core/store/userData";

export const TextBox = () => {
    useEffect(() => {

    });
    const StageStore = useStore(stageStateStore);
    const userDataStore = useStore(userDataStateStore);
    const textDelay = 55 - 20 * userDataStore.userDataState.optionData.textSpeed;
    const size = userDataStore.userDataState.optionData.textSize * 50 + 200 + '%';

    // 拆字
    const textArray: Array<string> = StageStore.stageState.showText.split('');
    const textElementList = textArray.map((e, index) => {
        return <span className={styles.TextBox_textElement_start}
                     key={index + 'textElement' + e + StageStore.stageState.showText}
                     style={{animationDelay: String(index * textDelay) + 'ms'}}>{e}</span>;
    });
    return <div id="textBoxMain" className={styles.TextBox_main}>
        {StageStore.stageState.showName !== '' &&
            <div className={styles.TextBox_showName} style={{fontSize: '200%'}}>{StageStore.stageState.showName}</div>}
        <div style={{fontSize: size}}>
            {textElementList}
        </div>
    </div>;

};
