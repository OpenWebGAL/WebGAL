import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { MenuPanelTag } from '@/store/guiInterface';
import useTrans from '@/hooks/useTrans';
import { continueGame, startGame } from '@/Core/controller/gamePlay/startContinueGame';
import { ScreenSlotRenderer } from '@/screens/ScreenSlotRenderer';
import { useUiCommonProps } from '@/screens/stage/shared';
import { useUiMockDataEnabled } from '@/sdk/mockData';
import { showGlogalDialog } from '../GlobalDialog/GlobalDialog';

/** 标题页 */
export default function Title() {
  const userDataState = useSelector((state: RootState) => state.userData);
  const userSaveData = useSelector((state: RootState) => state.saveData);
  const GUIState = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();
  const mockDataEnabled = useUiMockDataEnabled();
  const uiCommon = useUiCommonProps();
  const background = GUIState.titleBg;
  const t = useTrans('title.');
  const tCommon = useTrans('common.');
  const fastSaveData = userSaveData.quickSaveData;
  const enableContinue = userDataState.globalGameVar.Enable_Continue !== false;

  const appreciationItems = useSelector((state: RootState) => state.userData.appreciationData);
  const hasAppreciationItems = appreciationItems.bgm.length > 0 || appreciationItems.cg.length > 0;

  return (
    <ScreenSlotRenderer
      screen="title"
      screenProps={{
        visible: GUIState.showTitle,
        backgroundUrl: background,
        canContinue: mockDataEnabled ? true : Boolean(fastSaveData),
        enableContinue,
        enableExtra: mockDataEnabled ? true : GUIState.enableAppreciationMode,
        hasAppreciationItems: mockDataEnabled ? true : hasAppreciationItems,
        onStart: () => {
          startGame();
        },
        onContinue: () => {
          if (fastSaveData) {
            continueGame();
          }
        },
        onOpenLoad: () => {
          dispatch(setVisibility({ component: 'showMenuPanel', visibility: true }));
          dispatch(setMenuPanelTag(MenuPanelTag.Load));
        },
        onOpenOptions: () => {
          dispatch(setVisibility({ component: 'showMenuPanel', visibility: true }));
          dispatch(setMenuPanelTag(MenuPanelTag.Option));
        },
        onOpenExtra: () => {
          if (hasAppreciationItems || mockDataEnabled) {
            dispatch(setVisibility({ component: 'showExtra', visibility: true }));
          }
        },
        onExit: () => {
          showGlogalDialog({
            title: t('exit.tips'),
            leftText: tCommon('yes'),
            rightText: tCommon('no'),
            leftFunc: () => {
              window.close();
            },
            rightFunc: () => {},
          });
        },
        ...uiCommon,
      }}
    />
  );
}
