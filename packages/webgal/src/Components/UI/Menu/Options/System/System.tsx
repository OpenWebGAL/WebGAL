import styles from '@/Components/UI/Menu/Options/options.module.scss';
import { NormalOption } from '@/Components/UI/Menu/Options/NormalOption';
import { NormalButton } from '@/Components/UI/Menu/Options/NormalButton';
import { resetAllData, resetOptionSet, resetSaveData, setOptionData } from '@/store/userDataReducer';
import { playSpeed } from '@/store/userDataInterface';
import { getStorage, setStorage, syncStorageFast } from '@/Core/controller/storage/storageController';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { showGlogalDialog } from '@/Components/UI/GlobalDialog/GlobalDialog';
import localforage from 'localforage';
import { logger } from '@/Core/util/etc/logger';
import useTrans from '@/hooks/useTrans';
import useLanguage from '@/hooks/useLanguage';
import languages, { language } from '@/config/language';
import { useState } from 'react';
import About from '@/Components/UI/Menu/Options/System/About';
import { WebGAL } from '@/Core/WebGAL';

export function System() {
  const userDataState = useSelector((state: RootState) => state.userData);
  const dispatch = useDispatch();
  const setLanguage = useLanguage();
  const t = useTrans('menu.options.pages.system.options.');

  function exportSaves() {
    setStorage();
    localforage.getItem(WebGAL.gameKey).then((newUserData) => {
      const saves = JSON.stringify(newUserData);
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
    });
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

  function importSavesEventHandler(ev: any) {
    // const t = useTrans('menu.options.pages.system.options.');

    const file = ev.target.files[0];
    const reader = new FileReader();
    reader.onload = (evR) => {
      const saves = evR!.target!.result as string;
      try {
        const saveAsObj = JSON.parse(saves);
        showGlogalDialog({
          title: t('gameSave.dialogs.import.title'),
          leftText: t('$common.yes'),
          rightText: t('$common.no'),
          leftFunc: () => {
            localforage.setItem(WebGAL.gameKey, saveAsObj).then(() => {
              logger.info(t('gameSave.dialogs.import.tip'));
            });
            getStorage();
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
                  showGlogalDialog({
                    title: t('resetData.dialogs.clearGameSave'),
                    leftText: t('$common.yes'),
                    rightText: t('$common.no'),
                    leftFunc: () => {
                      dispatch(resetSaveData());
                      syncStorageFast();
                    },
                    rightFunc: () => {},
                  });
                },
                () => {
                  showGlogalDialog({
                    title: t('resetData.dialogs.resetSettings'),
                    leftText: t('$common.yes'),
                    rightText: t('$common.no'),
                    leftFunc: () => {
                      dispatch(resetOptionSet());
                      syncStorageFast();
                    },
                    rightFunc: () => {},
                  });
                },
                () => {
                  showGlogalDialog({
                    title: t('resetData.dialogs.clearAll'),
                    leftText: t('$common.yes'),
                    rightText: t('$common.no'),
                    leftFunc: () => {
                      dispatch(resetAllData());
                      syncStorageFast();
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
