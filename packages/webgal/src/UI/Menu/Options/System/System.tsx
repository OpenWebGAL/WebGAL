import styles from '@/UI/Menu/Options/options.module.scss';
import { NormalOption } from '@/UI/Menu/Options/NormalOption';
import { NormalButton } from '@/UI/Menu/Options/NormalButton';
import { resetAllData, resetOptionSet, setOptionData } from '@/store/userDataReducer';
import { IUserData, playSpeed } from '@/store/userDataInterface';
import { getStorage, setStorage, dumpToStorageFast } from '@/Core/controller/storage/storageController';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { showGlobalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import localforage from 'localforage';
import { logger } from '@/Core/util/logger';
import useTrans from '@/hooks/useTrans';
import useLanguage from '@/hooks/useLanguage';
import languages, { language } from '@/config/language';
import { useState } from 'react';
import { WebGAL } from '@/Core/WebGAL';
import useSoundEffect from '@/hooks/useSoundEffect';
import savesReducer, { ISavesData, saveActions } from '@/store/savesReducer';
import { dumpFastSaveToStorage, dumpSavesToStorage } from '@/Core/controller/storage/savesController';
import { NormalSlider } from '@/UI/Menu/Options/NormalSlider';
import useApplyStyle from '@/hooks/useApplyStyle';

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
  const applyStyle = useApplyStyle('UI/Menu/Options/options.scss');

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
        showGlobalDialog({
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

  return (
    <div className={applyStyle('options_page_container', styles.options_page_container)}>
      <NormalOption key="option1" title={t('autoSpeed.title')}>
        <NormalSlider
          initValue={userDataState.optionData.autoSpeed}
          uniqueID={t('autoSpeed.title')}
          onChange={(event) => {
            const newValue = event.target.value;
            dispatch(setOptionData({ key: 'autoSpeed', value: Number(newValue) }));
            setStorage();
          }}
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
              showGlobalDialog({
                title: t('resetData.dialogs.clearGameSave'),
                leftText: t('$common.cancel'),
                rightText: t('$common.confirm'),
                leftFunc: () => {},
                rightFunc: () => {
                  dispatch(saveActions.resetSaves());
                  dumpSavesToStorage(0, 200);
                  dumpFastSaveToStorage();
                },
              });
            },
            () => {
              playSeDialogOpen();
              showGlobalDialog({
                title: t('resetData.dialogs.resetSettings'),
                leftText: t('$common.cancel'),
                rightText: t('$common.confirm'),
                leftFunc: () => {},
                rightFunc: () => {
                  dispatch(resetOptionSet());
                  dumpToStorageFast();
                },
              });
            },
            () => {
              playSeDialogOpen();
              showGlobalDialog({
                title: t('resetData.dialogs.clearAll'),
                leftText: t('$common.cancel'),
                rightText: t('$common.confirm'),
                leftFunc: () => {},
                rightFunc: () => {
                  dispatch(resetAllData());
                  dumpToStorageFast();
                  dispatch(saveActions.resetSaves());
                  dumpSavesToStorage(0, 200);
                  dumpFastSaveToStorage();
                },
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
    </div>
  );
}
