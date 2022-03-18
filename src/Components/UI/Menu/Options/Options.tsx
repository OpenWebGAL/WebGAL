import {FC} from "react";
import styles from './options.module.scss'

export const Options: FC = () => {
    return <div className={styles.Options_main}>
        <div className={styles.Options_top}>
            <div className={styles.Options_title}>
                <div className={styles.Option_title_text}>选项</div>
            </div>
        </div>
    </div>
}