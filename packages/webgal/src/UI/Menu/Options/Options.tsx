import { FC, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { __INFO } from '@/config/info';
import languages, { language } from '@/config/language';
import { getStorage, setStorage } from '@/Core/controller/storage/storageController';
import useFullScreen from '@/hooks/useFullScreen';
import useLanguage from '@/hooks/useLanguage';
import useSoundEffect from '@/hooks/useSoundEffect';
import { useStageState } from '@/hooks/useStageState';
import useTrans from '@/hooks/useTrans';
import { MENU_BUILTIN_SCREENS } from '@/screens/menu';
import { registerBuiltInScreens } from '@/screens/screenRegistry';
import { ScreenSlotRenderer } from '@/screens/ScreenSlotRenderer';
import { useUiCommonProps } from '@/screens/stage/shared';
import { RootState } from '@/store/store';
import { setOptionData } from '@/store/userDataReducer';
import {
  exportSavesToJsonFile,
  importSavesFromFile,
  requestResetAllDialog,
  requestResetOptionsDialog,
  requestResetSavesDialog,
} from '@/UI/Menu/Options/System/System';

registerBuiltInScreens(MENU_BUILTIN_SCREENS);

export interface OptionsConnectorProps {
  visible?: boolean;
}

export const Options: FC<OptionsConnectorProps> = ({ visible = true }) => {
  const { playSeDialogOpen } = useSoundEffect();
  const dispatch = useDispatch();
  const optionData = useSelector((state: RootState) => state.userData.optionData);
  const fontOptions = useSelector((state: RootState) => state.GUI.fontOptions);
  const stageState = useStageState();
  const previewBgUrl = stageState.bgName;
  const setLanguage = useLanguage();
  const {
    isSupported: isFullscreenSupported,
    isFullScreen: isFullscreen,
    enter: enterFullscreen,
    exit: exitFullscreen,
  } = useFullScreen();
  const uiCommon = useUiCommonProps();
  const tSystemOptions = useTrans('menu.options.pages.system.options.');

  useEffect(getStorage, []);

  const languageOptions = useMemo(
    () =>
      Object.keys(languages).map((key) => ({
        value: language[key as keyof typeof language] as number,
        label: languages[key],
      })),
    [],
  );

  return (
    <ScreenSlotRenderer
      screen="options"
      screenProps={{
        visible,
        optionData,
        fontOptions,
        languageOptions,
        isFullscreenSupported,
        isFullscreen,
        previewBgUrl,
        version: __INFO.version,
        onChangeOption: (key, value) => {
          dispatch(setOptionData({ key, value }));
          setStorage();
        },
        onChangeLanguage: (lang) => setLanguage(lang as language),
        onToggleFullscreen: (enable) => (enable ? enterFullscreen() : exitFullscreen()),
        onResetSaves: () => requestResetSavesDialog(tSystemOptions, playSeDialogOpen),
        onResetOptions: () => requestResetOptionsDialog(tSystemOptions, playSeDialogOpen),
        onResetAll: () => requestResetAllDialog(tSystemOptions, playSeDialogOpen),
        onExportSaves: () => void exportSavesToJsonFile(),
        onImportSaves: (file) => importSavesFromFile(file, tSystemOptions, playSeDialogOpen),
        ...uiCommon,
      }}
    />
  );
};
