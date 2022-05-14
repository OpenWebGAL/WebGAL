import styles from './textbox.module.scss';
import {useEffect} from "react";
import {useSelector} from "react-redux";
import {RootState} from "@/Core/store/store";

export const TextBox = () => {
    const stageState = useSelector((state: RootState) => state.stage);
    const userDataState = useSelector((state: RootState) => state.userData);
    useEffect(() => {

    });
    const textDelay = 55 - 20 * userDataState.optionData.textSpeed;
    const size = userDataState.optionData.textSize * 50 + 200 + '%';

    // 拆字
    const textArray: Array<string> = stageState.showText.split('');
    const textElementList = textArray.map((e, index) => {
        return <span className={styles.TextBox_textElement_start}
                     key={index + 'textElement' + e + stageState.showText}
                     style={{animationDelay: String(index * textDelay) + 'ms'}}>{e}</span>;
    });
    return <div id="textBoxMain" className={styles.TextBox_main}>
        <div id="miniAvatar" className={styles.miniAvatarContainer}>
            {stageState.miniAvatar !== '' &&
                <img className={styles.miniAvatarImg} alt="miniAvatar" src={stageState.miniAvatar}/>}
        </div>
        {stageState.showName !== '' &&
            <div className={styles.TextBox_showName} style={{fontSize: '200%'}}>{stageState.showName}</div>}
        <div style={{fontSize: size}}>
            {textElementList}
        </div>
    </div>;

};
