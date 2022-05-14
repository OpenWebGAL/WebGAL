import styles from './menuPanel.module.scss';
import {MenuPanelButton} from "./MenuPanelButton";
import {playBgm} from "@/Core/util/playBgm";
import {MenuPanelTag} from '@/Core/interface/stateInterface/guiInterface';
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/Core/store/store";
import {setMenuPanelTag, setVisibility} from "@/Core/store/GUIReducer";

/**
 * Menu页的底栏
 * @constructor
 */
export const MenuPanel = () => {
    const GUIState = useSelector((state: RootState) => state.GUI);
    const dispatch = useDispatch();
    // 设置Menu按钮的高亮
    const SaveTagOn = GUIState.currentMenuTag === MenuPanelTag.Save ? ` ${styles.MenuPanel_button_hl}` : ``;
    const LoadTagOn = GUIState.currentMenuTag === MenuPanelTag.Load ? ` ${styles.MenuPanel_button_hl}` : ``;
    const OptionTagOn = GUIState.currentMenuTag === MenuPanelTag.Option ? ` ${styles.MenuPanel_button_hl}` : ``;

    // 设置Menu按钮的颜色
    const SaveTagColor = GUIState.currentMenuTag === MenuPanelTag.Save ? `rgba(74, 34, 93, 0.9)` : `rgba(8, 8, 8, 0.3)`;
    const LoadTagColor = GUIState.currentMenuTag === MenuPanelTag.Load ? `rgba(11, 52, 110, 0.9)` : `rgba(8, 8, 8, 0.3)`;
    const OptionTagColor = GUIState.currentMenuTag === MenuPanelTag.Option ? `rgba(81, 110, 65, 0.9)` : `rgba(8, 8, 8, 0.3)`;

    // 设置Menu图标的颜色
    const SaveIconColor = GUIState.currentMenuTag === MenuPanelTag.Save ? `rgba(74, 34, 93, 0.9)` : `rgba(185, 185, 185, 1)`;
    const LoadIconColor = GUIState.currentMenuTag === MenuPanelTag.Load ? `rgba(11, 52, 110, 0.9)` : `rgba(185, 185, 185, 1)`;
    const OptionIconColor = GUIState.currentMenuTag === MenuPanelTag.Option ? `rgba(81, 110, 65, 0.9)` : `rgba(185, 185, 185, 1)`;

    return <div className={styles.MenuPanel_main}>
        <MenuPanelButton iconName="save" buttonOnClassName={SaveTagOn} iconColor={SaveIconColor}
                         tagColor={SaveTagColor}
                         clickFunc={() => {
                             dispatch(setMenuPanelTag(MenuPanelTag.Save));
                         }}
                         tagName="存档" key="saveButton"/>
        <MenuPanelButton iconName="load" buttonOnClassName={LoadTagOn} iconColor={LoadIconColor}
                         tagColor={LoadTagColor}
                         clickFunc={() => {
                             dispatch(setMenuPanelTag(MenuPanelTag.Load));
                         }}
                         tagName="读档" key="loadButton"/>
        <MenuPanelButton iconName="option" buttonOnClassName={OptionTagOn} iconColor={OptionIconColor}
                         tagColor={OptionTagColor}
                         clickFunc={() => {
                             dispatch(setMenuPanelTag(MenuPanelTag.Option));
                         }}
                         tagName="选项" key="optionButton"/>
        <MenuPanelButton iconName="title"
                         clickFunc={() => {
                             dispatch(setVisibility({component: 'showTitle', visibility: true}));
                             dispatch(setVisibility({component: 'showMenuPanel', visibility: false}));
                             playBgm(GUIState.titleBgm);
                         }
                         }
                         tagName="标题" key="titleIcon"/>
        <MenuPanelButton iconName="exit"
                         clickFunc={() => {
                             dispatch(setVisibility({component: 'showMenuPanel', visibility: false}));
                         }
                         }
                         tagName="返回" key="exitIcon"/>
    </div>;
};
