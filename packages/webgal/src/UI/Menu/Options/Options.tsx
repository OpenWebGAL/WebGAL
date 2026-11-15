import { FC, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './options.module.scss';
import { __INFO } from '@/config/info';
import languages, { language } from '@/config/language';
import { getStorage, setStorage } from '@/Core/controller/storage/storageController';
import useFullScreen from '@/hooks/useFullScreen';
import useLanguage from '@/hooks/useLanguage';
import useSoundEffect from '@/hooks/useSoundEffect';
import { useStageState } from '@/hooks/useStageState';
import useTrans from '@/hooks/useTrans';
import { useValue } from '@/hooks/useValue';
import { MENU_BUILTIN_SCREENS } from '@/screens/menu';
import { registerBuiltInScreens } from '@/screens/screenRegistry';
import { ScreenSlotRenderer } from '@/screens/ScreenSlotRenderer';
import { useIsCustomUiTemplate, useUiCommonProps } from '@/screens/stage/shared';
import { RootState } from '@/store/store';
import { setOptionData } from '@/store/userDataReducer';
import { Display } from '@/UI/Menu/Options/Display/Display';
import { Sound } from '@/UI/Menu/Options/Sound/Sound';
import {
  exportSavesToJsonFile,
  importSavesFromFile,
  requestResetAllDialog,
  requestResetOptionsDialog,
  requestResetSavesDialog,
  System,
} from '@/UI/Menu/Options/System/System';

registerBuiltInScreens(MENU_BUILTIN_SCREENS);

enum optionPage {
  'System',
  'Display',
  'Sound',
}

export interface OptionsConnectorProps {
  visible?: boolean;
}

export const Options: FC<OptionsConnectorProps> = ({ visible = true }) => {
  const { playSeEnter, playSeSwitch, playSeDialogOpen } = useSoundEffect();
  const currentOptionPage = useValue(optionPage.System);
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
  const isCustomUi = useIsCustomUiTemplate();
  const uiCommon = useUiCommonProps();
  const t = useTrans('menu.options.');
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

  if (isCustomUi) {
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
  }

  function getClassName(page: optionPage) {
    if (page === currentOptionPage.value) {
      return styles.Options_page_button + ' ' + styles.Options_page_button_active;
    } else return styles.Options_page_button;
  }

  return (
    <div className={styles.Options_main}>
      <div className={styles.Options_top}>
        <div className={styles.Options_title}>
          <div className={styles.Option_title_text}>{t('title')}</div>
        </div>
      </div>
      <div className={styles.Options_page_container}>
        <div className={styles.Options_button_list}>
          <div
            onClick={() => {
              currentOptionPage.set(optionPage.System);
              playSeSwitch();
            }}
            className={getClassName(optionPage.System)}
            onMouseEnter={playSeEnter}
          >
            {t('pages.system.title')}
          </div>
          <div
            onClick={() => {
              currentOptionPage.set(optionPage.Display);
              playSeSwitch();
            }}
            className={getClassName(optionPage.Display)}
            onMouseEnter={playSeEnter}
          >
            {t('pages.display.title')}
          </div>
          <div
            onClick={() => {
              currentOptionPage.set(optionPage.Sound);
              playSeSwitch();
            }}
            className={getClassName(optionPage.Sound)}
            onMouseEnter={playSeEnter}
          >
            {t('pages.sound.title')}
          </div>
        </div>
        <div className={styles.Options_main_content}>
          {currentOptionPage.value === optionPage.Display && <Display />}
          {currentOptionPage.value === optionPage.System && <System />}
          {currentOptionPage.value === optionPage.Sound && <Sound />}
        </div>
      </div>
    </div>
  );
};
