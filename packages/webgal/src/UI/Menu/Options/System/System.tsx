import localforage from 'localforage';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Info } from '@icon-park/react';
import { WebGAL } from '@/Core/WebGAL';
import { getStorage, setStorage, dumpToStorageFast } from '@/Core/controller/storage/storageController';
import { logger } from '@/Core/util/logger';
import languages, { language } from '@/config/language';
import useLanguage from '@/hooks/useLanguage';
import useSoundEffect from '@/hooks/useSoundEffect';
import useTrans from '@/hooks/useTrans';
import { RootState, webgalStore } from '@/store/store';
import { saveActions } from '@/store/savesReducer';
import { resetAllData, resetOptionSet, setOptionData } from '@/store/userDataReducer';
import { playSpeed } from '@/store/userDataInterface';
import { showGlogalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import { NormalButton } from '@/UI/Menu/Options/NormalButton';
import { NormalOption } from '@/UI/Menu/Options/NormalOption';
import { OptionSlider } from '@/UI/Menu/Options/OptionSlider';
import About from '@/UI/Menu/Options/System/About';
import styles from '@/UI/Menu/Options/options.module.scss';
import {
  clearAllSavesFromStorage,
  ExportGameData,
  loadAllSavesFromStorage,
  persistImportedSavesToStorage,
} from '@/UI/Menu/SaveAndLoad/saveStorageHelpers';

export async function exportSavesToJsonFile(): Promise<void> {
  // 存档按分页懒加载，导出前动态扫描本地存储全部真实存档槽位
  await loadAllSavesFromStorage();
  const gameData: ExportGameData = {
    userData: webgalStore.getState().userData,
    saves: webgalStore.getState().saveData,
  };
  const jsonText = JSON.stringify(gameData);
  const blob = new Blob([jsonText], { type: 'application/json' });
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = 'saves.json';
  a.click();
  a.remove();
  URL.revokeObjectURL(blobUrl);
}

export function importSavesFromFile(
  file: File,
  tSystemOptions: (key: string) => string,
  playSeDialogOpen: () => void,
): void {
  const reader = new FileReader();
  reader.onload = (evR) => {
    const raw = evR.target?.result;
    if (typeof raw !== 'string') return;
    try {
      const saveAsObj = JSON.parse(raw) as Partial<ExportGameData> | null;
      if (
        !saveAsObj ||
        typeof saveAsObj !== 'object' ||
        !saveAsObj.userData ||
        typeof saveAsObj.userData !== 'object' ||
        !saveAsObj.saves ||
        typeof saveAsObj.saves !== 'object'
      ) {
        throw new Error('Invalid save data structure');
      }
      const importedUserData = saveAsObj.userData;
      const importedSaveData = Array.isArray(saveAsObj.saves.saveData) ? saveAsObj.saves.saveData : [];
      const importedQuickSave = saveAsObj.saves.quickSaveData;
      playSeDialogOpen();
      showGlogalDialog({
        title: tSystemOptions('gameSave.dialogs.import.title'),
        leftText: tSystemOptions('$common.yes'),
        rightText: tSystemOptions('$common.no'),
        leftFunc: async () => {
          await localforage.setItem(WebGAL.gameKey, importedUserData);
          logger.info(tSystemOptions('gameSave.dialogs.import.tip'));
          getStorage();
          webgalStore.dispatch(saveActions.replaceSaveGame(importedSaveData));
          webgalStore.dispatch(saveActions.setFastSave(importedQuickSave));
          await persistImportedSavesToStorage(importedSaveData);
        },
        rightFunc: () => {},
      });
    } catch (e) {
      logger.error(tSystemOptions('gameSave.dialogs.import.error'), e);
    }
  };
  reader.readAsText(file, 'UTF-8');
}

export function requestResetSavesDialog(tSystemOptions: (key: string) => string, playSeDialogOpen: () => void): void {
  playSeDialogOpen();
  showGlogalDialog({
    title: tSystemOptions('resetData.dialogs.clearGameSave'),
    leftText: tSystemOptions('$common.yes'),
    rightText: tSystemOptions('$common.no'),
    leftFunc: () => {
      void clearAllSavesFromStorage();
    },
    rightFunc: () => {},
  });
}

export function requestResetOptionsDialog(tSystemOptions: (key: string) => string, playSeDialogOpen: () => void): void {
  playSeDialogOpen();
  showGlogalDialog({
    title: tSystemOptions('resetData.dialogs.resetSettings'),
    leftText: tSystemOptions('$common.yes'),
    rightText: tSystemOptions('$common.no'),
    leftFunc: () => {
      webgalStore.dispatch(resetOptionSet());
      dumpToStorageFast();
    },
    rightFunc: () => {},
  });
}

export function requestResetAllDialog(tSystemOptions: (key: string) => string, playSeDialogOpen: () => void): void {
  playSeDialogOpen();
  showGlogalDialog({
    title: tSystemOptions('resetData.dialogs.clearAll'),
    leftText: tSystemOptions('$common.yes'),
    rightText: tSystemOptions('$common.no'),
    leftFunc: () => {
      webgalStore.dispatch(resetAllData());
      WebGAL.flowchartManager.clearProgress();
      dumpToStorageFast();
      void clearAllSavesFromStorage();
    },
    rightFunc: () => {},
  });
}

export function System() {
  const userDataState = useSelector((state: RootState) => state.userData);
  const dispatch = useDispatch();
  const setLanguage = useLanguage();
  const t = useTrans('menu.options.pages.system.options.');
  const { playSeDialogOpen, playSeEnter, playSeSwitch } = useSoundEffect();

  const importSaves = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (ev) => {
      const target = ev.target as HTMLInputElement | null;
      const file = target?.files?.[0];
      if (file) {
        importSavesFromFile(file, t, playSeDialogOpen);
      }
      input.remove();
    };
    input.click();
  };

  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const toggleLanguageSelect = () => {
    playSeSwitch();
    setShowLanguageSelect(!showLanguageSelect);
  };

  const toggleAbout = () => {
    playSeSwitch();
    setShowAbout(!showAbout);
  };

  const getLanguageName = (lang: language) => languages[language[lang]] || '日本語';

  return (
    <div className={styles.Options_main_content_half}>
      {showAbout ? (
        <About onClose={toggleAbout} />
      ) : (
        <>
          <NormalOption key="option0" title={t('autoSpeed.title')}>
            <NormalButton
              textList={t('autoSpeed.options.slow', 'autoSpeed.options.medium', 'autoSpeed.options.fast')}
              functionList={[
                () => {
                  dispatch(setOptionData({ key: 'autoSpeed', value: playSpeed.slow }));
                  setStorage();
                },
                () => {
                  dispatch(setOptionData({ key: 'autoSpeed', value: playSpeed.normal }));
                  setStorage();
                },
                () => {
                  dispatch(setOptionData({ key: 'autoSpeed', value: playSpeed.fast }));
                  setStorage();
                },
              ]}
              currentChecked={userDataState.optionData.autoSpeed}
            />
          </NormalOption>
          <NormalOption key="option4" title={t('language.title')}>
            <div className={styles.language_select}>
              <div className={styles.language_select_button} onClick={toggleLanguageSelect} onMouseEnter={playSeEnter}>
                {getLanguageName(userDataState.optionData.language)}
              </div>
              {showLanguageSelect && (
                <div className={styles.language_select_dropdown}>
                  {Object.keys(languages).map((key) => {
                    const langValue = language[key as keyof typeof language];
                    return (
                      <div
                        key={key}
                        className={styles.language_select_dropdown_item}
                        onClick={() => {
                          setLanguage(langValue);
                          toggleLanguageSelect();
                        }}
                      >
                        {languages[key]}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </NormalOption>
          <NormalOption key="option1" title={t('skipAll.title')}>
            <OptionSlider
              initValue={userDataState.optionData.skipAll ? 100 : 0}
              uniqueID="skipAll"
              onChange={(event) => {
                const newValue = event.target.value;
                dispatch(setOptionData({ key: 'skipAll', value: Number(newValue) > 50 }));
                setStorage();
              }}
            />
          </NormalOption>
          <NormalOption key="option2" title={t('resetData.title')}>
            <NormalButton
              textList={t(
                'resetData.options.clearGameSave',
                'resetData.options.resetSettings',
                'resetData.options.clearAll',
              )}
              functionList={[
                () => requestResetSavesDialog(t, playSeDialogOpen),
                () => requestResetOptionsDialog(t, playSeDialogOpen),
                () => requestResetAllDialog(t, playSeDialogOpen),
              ]}
              currentChecked={3}
            />
          </NormalOption>
          <NormalOption key="option3" title={t('gameSave.title')}>
            <NormalButton
              textList={t('gameSave.options.export', 'gameSave.options.import')}
              functionList={[() => void exportSavesToJsonFile(), importSaves]}
              currentChecked={2}
            />
          </NormalOption>
          <div className={styles.About_title_text} onClick={toggleAbout}>
            <Info theme="outline" size="32" fill="#227D515F" />
          </div>
        </>
      )}
    </div>
  );
}
