import {FC} from "react";
import styles from "../SaveAndLoad.module.scss";
import {saveGame} from "../../../../../Core/controller/storage/saveGame";
import {useStore} from "reto";
import {userDataStateStore} from "../../../../../Core/store/userData";

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
        }} key={'Save_element_page' + i} className={classNameOfElement}>
            <div className={styles.Save_Load_top_button_text}>
                {i}
            </div>
        </div>
        page.push(element);
    }

    const showSaves = [];
    //现在尝试设置10个存档每页
    const start = (userData.userDataState.optionData.slPage - 1) * 10 + 1;
    const end = start + 9;
    for (let i = start; i <= end; i++) {
        const saveData = userData.userDataState.saveData[i];
        let saveElementContent = <div/>;
        if (saveData) {
            const speaker = saveData.nowStageState.showName === '' ? '' : `${saveData.nowStageState.showName}：`
            saveElementContent = <>
                <div className={styles.Save_Load_content_element_top}>
                    <div className={styles.Save_Load_content_element_top_index}>
                        {saveData.index}
                    </div>
                    <div className={styles.Save_Load_content_element_top_date}>
                        {saveData.saveTime}
                    </div>
                </div>
                <div className={styles.Save_Load_content_miniRen}>
                    <img className={styles.Save_Load_content_miniRen_bg} alt={'Save_img_preview'}
                         src={saveData.nowStageState.bgName}/>
                </div>
                <div className={styles.Save_Load_content_text}>
                    {speaker + saveData.nowStageState.showText}
                </div>
            </>
        } else {

        }
        const saveElement = <div onClick={() => saveGame(i)} key={'saveElement_' + i}
                                 className={styles.Save_Load_content_element}>
            {saveElementContent}
        </div>
        showSaves.push(saveElement);
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
        <div className={styles.Save_Load_content} id={'Save_content_page_' + userData.userDataState.optionData.slPage}>
            {showSaves}
        </div>
    </div>
}