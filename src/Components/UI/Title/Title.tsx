import {FC} from 'react'
import styles from './title.module.scss'
import {useStore} from 'reto'
import {GuiStateStore, MenuPanelTag} from "../../../Core/store/GUI";

/**
 * 标题页
 * @constructor
 */
const Title: FC = () => {
    const GuiStore = useStore(GuiStateStore);
    return <>
        {GuiStore.GuiState.showTitle &&
            <div className={styles.Title_main}
                 style={{
                     backgroundImage: `url("${GuiStore.GuiState.titleBg}")`,
                     backgroundSize: "cover"
                 }}>
                <div className={styles.Title_buttonList}>
                    <div className={styles.Title_button} onClick={() => GuiStore.setVisibility('showTitle', false)}>
                        开始游戏
                    </div>
                    <div className={styles.Title_button} onClick={() => GuiStore.setVisibility('showTitle', false)}>
                        继续游戏
                    </div>
                    <div className={styles.Title_button} onClick={() => {
                        GuiStore.setVisibility('showMenuPanel', true)
                        GuiStore.setMenuPanelTag(MenuPanelTag.Option)
                    }}>
                        游戏配置
                    </div>
                    <div className={styles.Title_button} onClick={() => {
                        GuiStore.setVisibility('showMenuPanel', true)
                        GuiStore.setMenuPanelTag(MenuPanelTag.Load)
                    }}>
                        读取存档
                    </div>
                </div>
            </div>}
    </>
}

export default Title;