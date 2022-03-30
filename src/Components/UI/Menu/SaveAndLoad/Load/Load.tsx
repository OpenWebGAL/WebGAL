import {FC} from "react";
import {loadGame} from "../../../../../Core/controller/storage/loadGame";
import styles from '../SaveAndLoad.module.scss'

export const Load: FC = () => {
    return <div className={styles.Save_Load_main}>
        <div className={styles.Save_Load_top}>
            <div className={styles.Save_Load_title}>
                <div className={styles.Load_title_text}>
                    读档
                </div>
            </div>
            <div onClick={() => loadGame(1)}>测试读档</div>
        </div>
    </div>
}