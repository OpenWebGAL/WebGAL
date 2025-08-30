import { FC } from 'react';
import styles from './menu.module.scss';
import { MenuPanel } from './MenuPanel/MenuPanel';
import { Save } from './SaveAndLoad/Save/Save';
import { Load } from './SaveAndLoad/Load/Load';
import { Options } from './Options/Options';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { MenuPanelTag } from '@/store/guiInterface';
import useApplyStyle from '@/hooks/useApplyStyle';
import { useDelayedVisibility } from '@/hooks/useDelayedVisibility';

/**
 * Menu 页面，包括存读档、选项等
 * @constructor
 */
const Menu: FC = () => {
  const GUIState = useSelector((state: RootState) => state.GUI);
  const userData = useSelector((state: RootState) => state.userData);

  // 菜单延迟退场
  const delayedShowMenuPanel = useDelayedVisibility(GUIState.showMenuPanel);

  const applyStyle = useApplyStyle('UI/Menu/menu.scss');
  let currentTag;
  switch (GUIState.currentMenuTag) {
    case MenuPanelTag.Save:
      currentTag = <Save />;
      break;
    case MenuPanelTag.Load:
      currentTag = <Load />;
      break;
    case MenuPanelTag.Option:
      currentTag = <Options />;
      break;
  }
  return (
    <>
      {delayedShowMenuPanel && (
        <div
          className={`${applyStyle('menu_main', styles.menu_main)} ${
            GUIState.showMenuPanel ? '' : applyStyle('menu_main_hide', styles.menu_main_hide)
          }`}
          style={{
            ['--ui-transition-duration' as any]: `${userData.optionData.uiTransitionDuration}ms`,
          }}
        >
          <MenuPanel />
          <div className={applyStyle('menu_tag_content', styles.menu_tag_content)}>{currentTag}</div>
        </div>
      )}
    </>
  );
};

export default Menu;
