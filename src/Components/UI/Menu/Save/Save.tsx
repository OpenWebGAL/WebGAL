import {FC} from "react";
import styles from "./save.module.scss";

export const Save: FC = () => {
    return <div className={styles.Save_main}>
        <div className={styles.Save_top}>
            <div className={styles.Save_title}>
                <div className={styles.Save_title_text}>
                    存档
                </div>
            </div>
        </div>
    </div>
}