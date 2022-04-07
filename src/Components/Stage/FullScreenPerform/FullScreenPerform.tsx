import styles from './fullScreenPerform.module.scss'
import {nextSentence} from "../../../Core/controller/gamePlay/nextSentence";

export const FullScreenPerform = () => {
    return <div className={styles.FullScreenPerform_main}>
        <div id={'videoContainer'}/>
        <div onClick={nextSentence} className={styles.introContainer} id={'introContainer'}/>
    </div>
}