import styles from './menuPanel.module.scss';
import { MenuPanelButton } from './MenuPanelButton';
import { playBgm } from '@/Core/controller/stage/playBgm';
import { MenuPanelTag } from '@/store/guiInterface';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';

/**
 * Menu页的底栏
 * @constructor
 */
export const MenuPanel = () => {
  // 国际化
  const t = useTrans('menu.');

  const { playSeClick, playSeClickCloseButton } = useSoundEffect();
  const GUIState = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();
  // 设置Menu按钮的高亮
  const SaveTagOn = GUIState.currentMenuTag === MenuPanelTag.Save ? ` ${styles.MenuPanel_button_hl}` : ``;
  const LoadTagOn = GUIState.currentMenuTag === MenuPanelTag.Load ? ` ${styles.MenuPanel_button_hl}` : ``;
  const OptionTagOn = GUIState.currentMenuTag === MenuPanelTag.Option ? ` ${styles.MenuPanel_button_hl}` : ``;

  // 设置Menu按钮的颜色
  const SaveTagColor = GUIState.currentMenuTag === MenuPanelTag.Save ? `rgba(74, 34, 93, 0.9)` : `rgba(8, 8, 8, 0.3)`;
  const LoadTagColor = GUIState.currentMenuTag === MenuPanelTag.Load ? `rgba(11, 52, 110, 0.9)` : `rgba(8, 8, 8, 0.3)`;
  const OptionTagColor =
    GUIState.currentMenuTag === MenuPanelTag.Option ? `rgba(81, 110, 65, 0.9)` : `rgba(8, 8, 8, 0.3)`;

  // 设置Menu图标的颜色
  const SaveIconColor =
    GUIState.currentMenuTag === MenuPanelTag.Save ? `rgba(74, 34, 93, 0.9)` : `rgba(185, 185, 185, 1)`;
  const LoadIconColor =
    GUIState.currentMenuTag === MenuPanelTag.Load ? `rgba(11, 52, 110, 0.9)` : `rgba(185, 185, 185, 1)`;
  const OptionIconColor =
    GUIState.currentMenuTag === MenuPanelTag.Option ? `rgba(81, 110, 65, 0.9)` : `rgba(185, 185, 185, 1)`;

  return (
    <div className={styles.MenuPanel_main}>
      <MenuPanelButton
        iconName="save"
        buttonOnClassName={SaveTagOn}
        iconColor={SaveIconColor}
        tagColor={SaveTagColor}
        clickFunc={() => {
          playSeClick();
          if (GUIState.showTitle) return;
          dispatch(setMenuPanelTag(MenuPanelTag.Save));
        }}
        tagName={t('saving.title')}
        key="saveButton"
      />
      <MenuPanelButton
        iconName="load"
        buttonOnClassName={LoadTagOn}
        iconColor={LoadIconColor}
        tagColor={LoadTagColor}
        clickFunc={() => {
          playSeClick();
          dispatch(setMenuPanelTag(MenuPanelTag.Load));
        }}
        tagName={t('loadSaving.title')}
        key="loadButton"
      />
      <MenuPanelButton
        iconName="option"
        buttonOnClassName={OptionTagOn}
        iconColor={OptionIconColor}
        tagColor={OptionTagColor}
        clickFunc={() => {
          playSeClick();
          dispatch(setMenuPanelTag(MenuPanelTag.Option));
        }}
        tagName={t('options.title')}
        key="optionButton"
      />
      <MenuPanelButton
        iconName="title"
        clickFunc={() => {
          playSeClickCloseButton();
          backToTitle();
          dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
        }}
        tagName={t('title.title')}
        key="titleIcon"
      />
      <MenuPanelButton
        iconName="exit"
        clickFunc={() => {
          playSeClickCloseButton();
          dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
        }}
        tagName={t('exit.title')}
        key="exitIcon"
      />
    </div>
  );
};
