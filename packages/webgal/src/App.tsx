import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeScript } from '@/Core/initializeScript';
import { playBgm } from '@/Core/controller/stage/playBgm';
import useConfigData from '@/hooks/useConfigData';
import { useFontFamily } from '@/hooks/useFontFamily';
import { keyboard } from '@/hooks/useHotkey';
import useSoundEffect from '@/hooks/useSoundEffect';
import { ScreenSlotRenderer } from '@/screens/ScreenSlotRenderer';
import { registerBuiltInScreens } from '@/screens/screenRegistry';
import { STAGE_BUILTIN_SCREENS } from '@/screens/stage';
import { useUiCommonProps } from '@/screens/stage/shared';
import { getMockChooseOptions, useActiveUiScreen, useUiMockDataEnabled } from '@/sdk/mockData';
import { setVisibility } from '@/store/GUIReducer';
import { RootState } from '@/store/store';
import { fullScreenOption } from '@/store/userDataInterface';
import Translation from '@/UI/Translation/Translation';
import { Stage } from '@/Stage/Stage';
import { BottomControlPanel } from '@/UI/BottomControlPanel/BottomControlPanel';
import { BottomControlPanelFilm } from '@/UI/BottomControlPanel/BottomControlPanelFilm';
import { Backlog } from '@/UI/Backlog/Backlog';
import Title from '@/UI/Title/Title';
import Logo from '@/UI/Logo/Logo';
import { Extra } from '@/UI/Extra/Extra';
import Menu from '@/UI/Menu/Menu';
import GlobalDialog from '@/UI/GlobalDialog/GlobalDialog';
import PanicOverlay from '@/UI/PanicOverlay/PanicOverlay';
import DevPanel from '@/UI/DevPanel/DevPanel';

registerBuiltInScreens(STAGE_BUILTIN_SCREENS);

function TitleEnterGameTarget() {
  const dispatch = useDispatch();
  const titleBgm = useSelector((state: RootState) => state.GUI.titleBgm);
  const fullScreen = useSelector((state: RootState) => state.userData.optionData.fullScreen);
  const { playSeEnter } = useSoundEffect();

  return (
    <div
      className="title__enter-game-target"
      onClick={() => {
        playBgm(titleBgm);
        dispatch(setVisibility({ component: 'isEnterGame', visibility: true }));
        if (fullScreen === fullScreenOption.on) {
          document.documentElement.requestFullscreen();
          if (keyboard) keyboard.lock(['Escape', 'F11']);
        }
      }}
      onMouseEnter={playSeEnter}
    />
  );
}

function ChooseMockPreview() {
  const mockDataEnabled = useUiMockDataEnabled();
  const activeUiScreen = useActiveUiScreen();
  const fontFamily = useFontFamily();
  const uiCommon = useUiCommonProps();

  if (activeUiScreen !== 'choose') {
    return null;
  }

  const hasRealChoose =
    typeof document !== 'undefined' &&
    document.querySelector('#chooseContainer [data-webgal-screen="choose"]') !== null;
  if (hasRealChoose) {
    return null;
  }

  return (
    <ScreenSlotRenderer
      screen="choose"
      screenProps={{
        visible: true,
        options: mockDataEnabled ? getMockChooseOptions() : [],
        fontFamily,
        onSelect: () => {},
        ...uiCommon,
      }}
    />
  );
}

export default function App() {
  useConfigData();

  useEffect(() => {
    initializeScript();
  }, []);

  return (
    <div className="App">
      <Translation />
      <Stage />
      <ChooseMockPreview />
      <BottomControlPanel />
      <BottomControlPanelFilm />
      <Backlog />
      <TitleEnterGameTarget />
      <Title />
      <Logo />
      <Extra />
      <Menu />
      <GlobalDialog />
      <PanicOverlay />
      <DevPanel />
    </div>
  );
}
