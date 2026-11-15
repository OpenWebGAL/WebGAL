import { FC } from 'react';
import { useSelector } from 'react-redux';
import styles from './menu.module.scss';
import { MENU_BUILTIN_SCREENS } from '@/screens/menu';
import { registerBuiltInScreens } from '@/screens/screenRegistry';
import { useIsCustomUiTemplate } from '@/screens/stage/shared';
import { MenuPanelTag } from '@/store/guiInterface';
import { RootState } from '@/store/store';
import { Flowchart } from '@/UI/Flowchart/Flowchart';
import { MenuPanel } from './MenuPanel/MenuPanel';
import { Options } from './Options/Options';
import { Load } from './SaveAndLoad/Load/Load';
import { Save } from './SaveAndLoad/Save/Save';

registerBuiltInScreens(MENU_BUILTIN_SCREENS);

/**
 * Menu 页面容器：
 * - 旧模板模式下保持原有包裹容器与样式；
 * - 新模板模式下将 save / load / options / flowchart 拆分为独立顶层 Screen 槽位，与 menuPanel 浮层协同工作。
 */
const Menu: FC = () => {
  const GUIState = useSelector((state: RootState) => state.GUI);
  const isCustomUi = useIsCustomUiTemplate();

  if (isCustomUi) {
    const show = GUIState.showMenuPanel;
    return (
      <>
        <Save visible={show && GUIState.currentMenuTag === MenuPanelTag.Save} />
        <Load visible={show && GUIState.currentMenuTag === MenuPanelTag.Load} />
        <Options visible={show && GUIState.currentMenuTag === MenuPanelTag.Option} />
        <Flowchart visible={show && GUIState.currentMenuTag === MenuPanelTag.Flowchart} />
        <MenuPanel />
      </>
    );
  }

  return (
    <>
      {GUIState.showMenuPanel && (
        <div className={styles.Menu_main}>
          <div className={styles.Menu_TagContent}>
            {GUIState.currentMenuTag === MenuPanelTag.Save && <Save />}
            {GUIState.currentMenuTag === MenuPanelTag.Load && <Load />}
            {GUIState.currentMenuTag === MenuPanelTag.Option && <Options />}
            {GUIState.currentMenuTag === MenuPanelTag.Flowchart && <Flowchart />}
          </div>
          <MenuPanel />
        </div>
      )}
    </>
  );
};

export default Menu;
