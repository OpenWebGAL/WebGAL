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
import { showGlogalDialog } from '@/UI/GlobalDialog/GlobalDialog';

/**
 * Menu页的底栏
 * @constructor
 */
export const MenuPanel = () => {
  // 国际化
  const t = useTrans('menu.');

  const { playSeClick, playSeDialogOpen, playSePageChange } = useSoundEffect();
  const GUIState = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();

  // 获取高亮样式和颜色的辅助函数
  const getButtonStyle = (tag: MenuPanelTag) => {
    const isActive = GUIState.currentMenuTag === tag;
    return {
      buttonClass: isActive ? ` ${styles.MenuPanel_button_hl}` : '',
    };
  };

  // 获取各菜单项的样式
  const saveStyle = getButtonStyle(MenuPanelTag.Save);
  const loadStyle = getButtonStyle(MenuPanelTag.Load);
  const optionStyle = getButtonStyle(MenuPanelTag.Option);

  return (
    <div className={styles.MenuPanel_main}>
      <MenuPanelButton
        iconName="save"
        buttonOnClassName={saveStyle.buttonClass}
        clickFunc={() => {
          playSePageChange();
          if (GUIState.showTitle) return;
          dispatch(setMenuPanelTag(MenuPanelTag.Save));
        }}
        tagName={t('saving.title')}
        key="saveButton"
      />
      <MenuPanelButton
        iconName="load"
        buttonOnClassName={loadStyle.buttonClass}
        clickFunc={() => {
          playSePageChange();
          dispatch(setMenuPanelTag(MenuPanelTag.Load));
        }}
        tagName={t('loadSaving.title')}
        key="loadButton"
      />
      <MenuPanelButton
        iconName="title"
        clickFunc={() => {
          playSeDialogOpen();
          showGlogalDialog({
            title: t('$gaming.buttons.titleTips'),
            leftText: t('$common.yes'),
            rightText: t('$common.no'),
            leftFunc: () => {
              backToTitle();
              dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
            },
            rightFunc: () => {},
          });
        }}
        tagName={t('title.title')}
        key="titleIcon"
      />
      <MenuPanelButton
        iconName="option"
        buttonOnClassName={optionStyle.buttonClass}
        clickFunc={() => {
          playSePageChange();
          dispatch(setMenuPanelTag(MenuPanelTag.Option));
        }}
        tagName={t('options.title')}
        key="optionButton"
      />
    </div>
  );
};
