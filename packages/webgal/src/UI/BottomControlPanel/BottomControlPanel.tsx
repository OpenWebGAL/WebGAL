import { switchAuto } from '@/Core/controller/gamePlay/autoPlay';
import { backToTitle } from '@/Core/controller/gamePlay/backToTitle';
import { switchFast } from '@/Core/controller/gamePlay/fastSkip';
import { loadGame } from '@/Core/controller/storage/loadGame';
import { saveGame } from '@/Core/controller/storage/saveGame';
import { showGlogalDialog, switchControls } from '@/UI/GlobalDialog/GlobalDialog';
import useFullScreen from '@/hooks/useFullScreen';
import useTrans from '@/hooks/useTrans';
import { setMenuPanelTag, setVisibility } from '@/store/GUIReducer';
import { componentsVisibility, MenuPanelTag } from '@/store/guiInterface';
import { RootState } from '@/store/store';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useStageState } from '@/hooks/useStageState';
import { WebGAL } from '@/Core/WebGAL';
import { ScreenSlotRenderer } from '@/screens/ScreenSlotRenderer';
import { useUiCommonProps } from '@/screens/stage/shared';
import { getMockQuickSavePreview, useActiveUiScreen, useUiMockDataEnabled } from '@/sdk/mockData';

export const BottomControlPanel = () => {
  const t = useTrans('gaming.');
  const { isSupported: isFullscreenSupport, isFullScreen, toggle: toggleFullscreen } = useFullScreen();
  const GUIStore = useSelector((state: RootState) => state.GUI);
  const enableFlowchart = useSelector((state: RootState) => state.userData.globalGameVar.Enable_flowchart === true);
  const stageState = useStageState();
  const dispatch = useDispatch();
  const setComponentVisibility = (component: keyof componentsVisibility, visibility: boolean) => {
    dispatch(setVisibility({ component, visibility }));
  };
  const setMenuPanel = (menuPanel: MenuPanelTag) => {
    dispatch(setMenuPanelTag(menuPanel));
  };

  const saveData = useSelector((state: RootState) => state.saveData.saveData);
  const mockDataEnabled = useUiMockDataEnabled();
  const activeUiScreen = useActiveUiScreen();
  const uiCommon = useUiCommonProps();
  const [isAuto, setIsAuto] = useState(() => WebGAL.gameplay.isAuto);
  const [isFast, setIsFast] = useState(() => WebGAL.gameplay.isFast);

  useEffect(() => {
    const sync = () => {
      setIsAuto(WebGAL.gameplay.isAuto);
      setIsFast(WebGAL.gameplay.isFast);
    };
    sync();
    const timer = window.setInterval(sync, 200);
    return () => window.clearInterval(timer);
  }, []);

  const isPreviewActive = activeUiScreen === 'bottomControlPanel';
  const visible = (GUIStore.showTextBox && stageState.enableFilm === '') || isPreviewActive;
  const quickSavePreview = saveData[0] ?? (mockDataEnabled ? getMockQuickSavePreview() : null);

  return (
    <ScreenSlotRenderer
      screen="bottomControlPanel"
      screenProps={{
        visible,
        controlsVisible: isPreviewActive ? true : GUIStore.controlsVisibility,
        isTextBoxVisible: GUIStore.showTextBox,
        isControlsLocked: GUIStore.showControls,
        isAuto,
        isFast,
        isFullscreen: isFullScreen,
        isFullscreenSupported: isFullscreenSupport,
        enableFlowchart: mockDataEnabled ? true : enableFlowchart,
        quickSavePreview,
        onToggleTextBox: () => setComponentVisibility('showTextBox', !GUIStore.showTextBox),
        onOpenBacklog: () => {
          setComponentVisibility('showBacklog', true);
          setComponentVisibility('showTextBox', false);
        },
        onOpenFlowchart: () => {
          setMenuPanel(MenuPanelTag.Flowchart);
          setComponentVisibility('showMenuPanel', true);
        },
        onReplayVocal: () => {
          const vocal = document.getElementById('currentVocal') as HTMLAudioElement | null;
          if (vocal) {
            vocal.currentTime = 0;
            vocal.pause();
            void vocal.play();
          }
        },
        onToggleAuto: () => {
          switchAuto();
          setIsAuto(WebGAL.gameplay.isAuto);
        },
        onToggleFast: () => {
          switchFast();
          setIsFast(WebGAL.gameplay.isFast);
        },
        onQuickSave: () => {
          saveGame(0);
        },
        onQuickLoad: () => {
          loadGame(0);
        },
        onOpenSave: () => {
          setMenuPanel(MenuPanelTag.Save);
          setComponentVisibility('showMenuPanel', true);
        },
        onOpenLoad: () => {
          setMenuPanel(MenuPanelTag.Load);
          setComponentVisibility('showMenuPanel', true);
        },
        onOpenOptions: () => {
          setMenuPanel(MenuPanelTag.Option);
          setComponentVisibility('showMenuPanel', true);
        },
        onBackToTitle: () => {
          showGlogalDialog({
            title: t('buttons.titleTips'),
            leftText: t('$common.yes'),
            rightText: t('$common.no'),
            leftFunc: () => {
              backToTitle();
            },
            rightFunc: () => {},
          });
        },
        onToggleFullscreen: toggleFullscreen,
        onToggleControlsLock: () => {
          switchControls();
        },
        ...uiCommon,
      }}
    />
  );
};
