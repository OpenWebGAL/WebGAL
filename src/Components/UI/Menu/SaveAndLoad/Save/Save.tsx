import {FC} from "react";
import styles from "../SaveAndLoad.module.scss";
import {saveGame} from "../../../../../Core/controller/storage/saveGame";

export const Save: FC = () => {
    return <div className={styles.Save_Load_main}>
        <div className={styles.Save_Load_top}>
            <div className={styles.Save_Load_title}>
                <div className={styles.Save_title_text}>
                    存档
                </div>
            </div>
            <div onClick={() => saveGame(1)}>测试存档</div>
        </div>
    </div>
}