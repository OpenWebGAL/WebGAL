import {FC} from "react";
import styles from "../SaveAndLoad.module.scss";
import {saveGame} from "../../../../../Core/controller/storage/saveGame";
import {useStore} from "reto";
import {userDataStateStore} from "../../../../../Core/store/userData";
import {syncStorageFast} from "../../../../../Core/controller/storage/storageController";

export const Save: FC = () => {
    const userData = useStore(userDataStateStore);
    const page = [];
    for (let i = 1; i <= 20; i++) {
        let classNameOfElement = styles.Save_Load_top_button;
        if (i === userData.userDataState.optionData.slPage) {
            classNameOfElement = classNameOfElement + ' ' + styles.Save_Load_top_button_on;
        }
        const element = <div onClick={() => {
            userData.setSlPage(i);
            syncStorageFast();
        }} key={'Save_element_page' + i} className={classNameOfElement}>
            <div className={styles.Save_Load_top_button_text}>
                {i}
            </div>
        </div>
        page.push(element);
    }

    return <div className={styles.Save_Load_main}>
        <div className={styles.Save_Load_top}>
            <div className={styles.Save_Load_title}>
                <div className={styles.Save_title_text}>
                    存档
                </div>
            </div>
            <div className={styles.Save_Load_top_buttonList}>
                {page}
            </div>
        </div>
        <div onClick={() => saveGame(1)}>测试存档</div>
    </div>
}