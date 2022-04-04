import styles from './backlog.module.scss'
import {useStore} from "reto";
import {GuiStateStore} from "../../../Core/store/GUI";
import {runtime_currentBacklog} from "../../../Core/runtime/backlog";
import {CloseSmall, Return, VolumeNotice} from '@icon-park/react';
import {jumpFromBacklog} from "../../../Core/controller/storage/jumpFromBacklog";

export const Backlog = () => {
    const GUIStore = useStore(GuiStateStore)
    const backlogList = [];
    for (let i = 0; i < runtime_currentBacklog.length; i++) {
        const backlogItem = runtime_currentBacklog[i];
        const singleBacklogView = <div className={styles.backlog_item}
                                       style={{animationDelay: `${20 * (runtime_currentBacklog.length - i)}ms`}}
                                       key={'backlogItem' +
                                           backlogItem.currentStageState.showText +
                                           backlogItem.saveScene.currentSentenceId}>
            <div className={styles.backlog_item_button_list}>
                <div onClick={(e) => {
                    jumpFromBacklog(i);
                    e.preventDefault();
                    e.stopPropagation();
                }} className={styles.backlog_item_button_element}>
                    <Return theme="outline" size="26" fill="#ffffff" strokeWidth={3}/>
                </div>
                <div className={styles.backlog_item_button_element}>
                    <VolumeNotice theme="outline" size="26" fill="#ffffff" strokeWidth={3}/>
                </div>
            </div>
            <div className={styles.backlog_item_content}>
                <span className={styles.backlog_item_content_name}>
                    {backlogItem.currentStageState.showName + '：'}
                </span>
                <span className={styles.backlog_item_content_text}>
                    {backlogItem.currentStageState.showText}
                </span>

            </div>
        </div>
        backlogList.unshift(singleBacklogView);
    }
    return <>
        {GUIStore.GuiState.showBacklog && < div className={styles.Backlog_main}>
            <div className={styles.backlog_top}>
                <CloseSmall className={styles.backlog_top_icon}
                            onClick={() => GUIStore.setVisibility('showBacklog', false)} theme="outline" size="4em"
                            fill="#ffffff" strokeWidth={3}/>
                <div className={styles.backlog_title}>回想</div>
            </div>
            <div className={styles.backlog_content}>
                {backlogList}
            </div>
        </div>}
    </>
}