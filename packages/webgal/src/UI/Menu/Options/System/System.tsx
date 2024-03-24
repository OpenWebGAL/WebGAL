import styles from '@/UI/Menu/Options/options.module.scss';
import { NormalOption } from '@/UI/Menu/Options/NormalOption';
import { NormalButton } from '@/UI/Menu/Options/NormalButton';
import { resetAllData, resetOptionSet, setOptionData } from '@/store/userDataReducer';
import { IUserData, playSpeed } from '@/store/userDataInterface';
import { getStorage, setStorage, dumpToStorageFast } from '@/Core/controller/storage/storageController';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { showGlogalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import localforage from 'localforage';
import { logger } from '@/Core/util/logger';
import useTrans from '@/hooks/useTrans';
import useLanguage from '@/hooks/useLanguage';
import languages, { language } from '@/config/language';
import { useState } from 'react';
import About from '@/UI/Menu/Options/System/About';
import { WebGAL } from '@/Core/WebGAL';
import useSoundEffect from '@/hooks/useSoundEffect';
import savesReducer, { ISavesData, saveActions } from '@/store/savesReducer';
import { dumpFastSaveToStorage, dumpSavesToStorage } from '@/Core/controller/storage/savesController';

interface IExportGameData {
  userData: IUserData;
  saves: ISavesData;
}

export function System() {
  const userDataState = useSelector((state: RootState) => state.userData);
  const userSavesState = useSelector((state: RootState) => state.saveData);
  const dispatch = useDispatch();
  const setLanguage = useLanguage();
  const t = useTrans('menu.options.pages.system.options.');
  const { playSeDialogOpen } = useSoundEffect();

  function exportSaves() {
    const gameData: IExportGameData = {
      userData: userDataState,
      saves: userSavesState,
    };

    const saves = JSON.stringify(gameData);
    if (saves !== null) {
      // @ts-ignore
      const blob = new Blob([saves], { type: 'application/json' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'saves.json';
      a.click();
      a.remove();
    }
  }

  function importSavesEventHandler(ev: any) {
    // const t = useTrans('menu.options.pages.system.options.');

    const file = ev.target.files[0];
    const reader = new FileReader();
    reader.onload = (evR) => {
      const saves = evR!.target!.result as string;
      try {
        const saveAsObj: IExportGameData = JSON.parse(saves);
        playSeDialogOpen();
        showGlogalDialog({
          title: t('gameSave.dialogs.import.title'),
          leftText: t('$common.yes'),
          rightText: t('$common.no'),
          leftFunc: async () => {
            await localforage.setItem(WebGAL.gameKey, saveAsObj.userData).then(() => {
              logger.info(t('gameSave.dialogs.import.tip'));
            });
            getStorage();
            webgalStore.dispatch(saveActions.replaceSaveGame(saveAsObj.saves.saveData));
            webgalStore.dispatch(saveActions.setFastSave(saveAsObj.saves.quickSaveData));
            dumpFastSaveToStorage();
            dumpSavesToStorage(0, 200);
          },
          rightFunc: () => {},
        });
      } catch (e) {
        logger.error(t('gameSave.dialogs.import.error'), e);
      }
      // window.location.reload(); // dirty: 强制刷新 UI
    };
    reader.readAsText(file, 'UTF-8');
  }

  function importSaves() {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.onchange = importSavesEventHandler;
    inputElement.click();
  }

  const [showAbout, setShowAbout] = useState(false);

  function toggleAbout() {
    setShowAbout(!showAbout);
  }

  return (
    <div className={styles.Options_main_content_half}>
      {showAbout && <About onClose={toggleAbout} />}
      {!showAbout && (
        <>
          <NormalOption key="option1" title={t('autoSpeed.title')}>
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
          <NormalOption key="option7" title={t('language.title')}>
            <NormalButton
              currentChecked={userDataState.optionData.language}
              textList={Object.values(languages)}
              functionList={Object.keys(languages).map(
                (k) => () => setLanguage(language[k as unknown as number] as unknown as language),
              )}
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
                () => {
                  playSeDialogOpen();
                  showGlogalDialog({
                    title: t('resetData.dialogs.clearGameSave'),
                    leftText: t('$common.yes'),
                    rightText: t('$common.no'),
                    leftFunc: () => {
                      dispatch(saveActions.resetSaves());
                      dumpSavesToStorage(0, 200);
                      dumpFastSaveToStorage();
                    },
                    rightFunc: () => {},
                  });
                },
                () => {
                  playSeDialogOpen();
                  showGlogalDialog({
                    title: t('resetData.dialogs.resetSettings'),
                    leftText: t('$common.yes'),
                    rightText: t('$common.no'),
                    leftFunc: () => {
                      dispatch(resetOptionSet());
                      dumpToStorageFast();
                    },
                    rightFunc: () => {},
                  });
                },
                () => {
                  playSeDialogOpen();
                  showGlogalDialog({
                    title: t('resetData.dialogs.clearAll'),
                    leftText: t('$common.yes'),
                    rightText: t('$common.no'),
                    leftFunc: () => {
                      dispatch(resetAllData());
                      dumpToStorageFast();
                      dispatch(saveActions.resetSaves());
                      dumpSavesToStorage(0, 200);
                      dumpFastSaveToStorage();
                    },
                    rightFunc: () => {},
                  });
                },
              ]}
              currentChecked={3}
            />
          </NormalOption>
          <NormalOption key="option3" title={t('gameSave.title')}>
            <NormalButton
              textList={t('gameSave.options.export', 'gameSave.options.import')}
              functionList={[exportSaves, importSaves]}
              currentChecked={2}
            />
          </NormalOption>
          <div className={styles.About_title_text} onClick={toggleAbout}>
            <span className={styles.About_text}>{t('about.title')}</span>
          </div>
        </>
      )}
    </div>
  );
}
