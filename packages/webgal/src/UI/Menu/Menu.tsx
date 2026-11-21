import { FC } from 'react';
import { useSelector } from 'react-redux';
import { MENU_BUILTIN_SCREENS } from '@/screens/menu';
import { registerBuiltInScreens } from '@/screens/screenRegistry';
import { MenuPanelTag } from '@/store/guiInterface';
import { RootState } from '@/store/store';
import { Flowchart } from '@/UI/Flowchart/Flowchart';
import { MenuPanel } from './MenuPanel/MenuPanel';
import { Options } from './Options/Options';
import { Load } from './SaveAndLoad/Load/Load';
import { Save } from './SaveAndLoad/Save/Save';

registerBuiltInScreens(MENU_BUILTIN_SCREENS);

/**
 * Menu 页面容器：将 save / load / options / flowchart 拆分为独立顶层 Screen 槽位，与 menuPanel 浮层协同工作。
 */
const Menu: FC = () => {
  const GUIState = useSelector((state: RootState) => state.GUI);
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
};

export default Menu;
