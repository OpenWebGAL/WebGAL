import { MenuPanelTag } from '@/store/guiInterface';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import useTrans from '@/hooks/useTrans';
import { showGlogalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import { ScreenSlotRenderer } from '@/screens/ScreenSlotRenderer';
import { useUiCommonProps } from '@/screens/stage/shared';
import { useUiMockDataEnabled } from '@/sdk/mockData';

/**
 * Menu页的底栏
 */
export const MenuPanel = () => {
  const t = useTrans('menu.');
  const GUIState = useSelector((state: RootState) => state.GUI);
  const enableFlowchart = useSelector((state: RootState) => state.userData.globalGameVar.Enable_flowchart === true);
  const dispatch = useDispatch();
  const mockDataEnabled = useUiMockDataEnabled();
  const uiCommon = useUiCommonProps();

  return (
    <ScreenSlotRenderer
      screen="menuPanel"
      screenProps={{
        visible: GUIState.showMenuPanel,
        activeTag: GUIState.currentMenuTag,
        canSave: mockDataEnabled ? true : !GUIState.showTitle,
        enableFlowchart: mockDataEnabled ? true : enableFlowchart,
        onSelectTag: (tag) => {
          if (tag === MenuPanelTag.Save && GUIState.showTitle && !mockDataEnabled) return;
          dispatch(setMenuPanelTag(tag));
        },
        onBackToTitle: () => {
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
        },
        onClose: () => {
          dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
        },
        ...uiCommon,
      }}
    />
  );
};
