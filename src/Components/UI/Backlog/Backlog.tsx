import styles from './backlog.module.scss'
import {useStore} from "reto";
import {GuiStateStore} from "../../../Core/store/GUI";
import {runtime_currentBacklog} from "../../../Core/runtime/backlog";
import {CloseSmall} from '@icon-park/react';

export const Backlog = () => {
    const GUIStore = useStore(GuiStateStore)
    const backlogList = [];
    for (let i = 0; i < runtime_currentBacklog.length; i++) {
        const backlogItem = runtime_currentBacklog[i];
        const singleBacklogView = <div className={styles.backlog_item}
                                       key={'backlogItem' +
                                           backlogItem.currentStageState.showText +
                                           backlogItem.saveScene.currentSentenceId}>
            {backlogItem.currentStageState.showText}
        </div>
        backlogList.unshift(singleBacklogView);
    }
    return <>
        {GUIStore.GuiState.showBacklog && < div className={styles.Backlog_main}>
            <div className={styles.backlog_top}>
                <CloseSmall
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