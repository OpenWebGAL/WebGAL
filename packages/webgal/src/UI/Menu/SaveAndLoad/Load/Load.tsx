import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../SaveAndLoad.module.scss';
import { loadGame } from '@/Core/controller/storage/loadGame';
import { getSavesFromStorage } from '@/Core/controller/storage/savesController';
import { setStorage } from '@/Core/controller/storage/storageController';
import useSoundEffect from '@/hooks/useSoundEffect';
import useTrans from '@/hooks/useTrans';
import { MENU_BUILTIN_SCREENS } from '@/screens/menu';
import { SaveSlotData } from '@/screens/contracts';
import { registerBuiltInScreens } from '@/screens/screenRegistry';
import { ScreenSlotRenderer } from '@/screens/ScreenSlotRenderer';
import { useIsCustomUiTemplate, useUiCommonProps } from '@/screens/stage/shared';
import { getMockSaveSlots, useUiMockDataEnabled } from '@/sdk/mockData';
import { RootState } from '@/store/store';
import { setSlPage } from '@/store/userDataReducer';
import { easyCompile } from '@/UI/Menu/SaveAndLoad/Save/Save';
import { getMaxSaveSlotIndexFromStorage } from '@/UI/Menu/SaveAndLoad/saveStorageHelpers';

registerBuiltInScreens(MENU_BUILTIN_SCREENS);

export interface LoadConnectorProps {
  visible?: boolean;
}

export const Load: FC<LoadConnectorProps> = ({ visible = true }) => {
  const { playSeClick, playSeEnter, playSePageChange } = useSoundEffect();
  const userDataState = useSelector((state: RootState) => state.userData);
  const saveDataState = useSelector((state: RootState) => state.saveData);
  const dispatch = useDispatch();
  const t = useTrans('menu.');
  const isCustomUi = useIsCustomUiTemplate();
  const mockDataEnabled = useUiMockDataEnabled();
  const uiCommon = useUiCommonProps();
  const [loadedRange, setLoadedRange] = useState({ start: 1, end: 12 });

  const slPage = userDataState.optionData.slPage;
  const start = (slPage - 1) * 10 + 1;
  const end = start + 9;

  useEffect(() => {
    if (!visible || mockDataEnabled) return;
    void getMaxSaveSlotIndexFromStorage().then((maxIdx) => {
      if (maxIdx > 0) {
        void getSavesFromStorage(maxIdx, maxIdx);
      }
    });
  }, [visible, mockDataEnabled]);

  useEffect(() => {
    if (!isCustomUi) {
      void getSavesFromStorage(start, end);
    }
  }, [isCustomUi, start, end]);

  const handleLoadRange = useCallback(
    (rangeStart: number, rangeEnd: number) => {
      setLoadedRange((prev) =>
        prev.start === rangeStart && prev.end === rangeEnd ? prev : { start: rangeStart, end: rangeEnd },
      );
      if (!mockDataEnabled) {
        void getSavesFromStorage(rangeStart, rangeEnd);
      }
    },
    [mockDataEnabled],
  );

  const handleSlotAction = useCallback(
    (index: number) => {
      if (mockDataEnabled) return;
      loadGame(index);
      playSeClick();
    },
    [mockDataEnabled, playSeClick],
  );

  const savesByIndex = useMemo(() => {
    if (mockDataEnabled) {
      return getMockSaveSlots(loadedRange.start, loadedRange.end);
    }
    const map: Record<number, SaveSlotData | null | undefined> = {};
    for (const [key, item] of Object.entries(saveDataState.saveData)) {
      const idx = Number(key);
      if (Number.isInteger(idx) && idx >= 0) {
        map[idx] = item;
      }
    }
    return map;
  }, [mockDataEnabled, loadedRange.start, loadedRange.end, saveDataState.saveData]);

  if (isCustomUi) {
    return (
      <ScreenSlotRenderer
        screen="load"
        screenProps={{
          visible,
          slPage,
          savesByIndex,
          onSelectPage: (page) => {
            dispatch(setSlPage(page));
            setStorage();
          },
          onLoadRange: handleLoadRange,
          onSlotAction: handleSlotAction,
          ...uiCommon,
        }}
      />
    );
  }

  const page = [];
  for (let i = 1; i <= 20; i++) {
    let classNameOfElement = styles.Save_Load_top_button + ' ' + styles.Load_top_button;
    if (i === slPage) {
      classNameOfElement = classNameOfElement + ' ' + styles.Save_Load_top_button_on + ' ' + styles.Load_top_button_on;
    }
    page.push(
      <div
        onClick={() => {
          dispatch(setSlPage(i));
          setStorage();
          playSePageChange();
        }}
        onMouseEnter={playSeEnter}
        key={'Load_element_page' + i}
        className={classNameOfElement}
      >
        <div className={styles.Save_Load_top_button_text}>{i}</div>
      </div>,
    );
  }

  const showSaves = [];
  let animationIndex = 0;
  for (let i = start; i <= end; i++) {
    animationIndex++;
    const saveData = saveDataState.saveData[i];
    let saveElementContent = <div />;
    if (saveData) {
      const speaker = saveData.nowStageState.showName === '' ? '\u00A0' : `${saveData.nowStageState.showName}`;
      const speakerView = easyCompile(speaker);
      saveElementContent = (
        <>
          <div className={styles.Save_Load_content_element_top}>
            <div className={styles.Save_Load_content_element_top_index + ' ' + styles.Load_content_elememt_top_index}>
              {saveData.index}
            </div>
            <div className={styles.Save_Load_content_element_top_date + ' ' + styles.Load_content_element_top_date}>
              {saveData.saveTime}
            </div>
          </div>
          <div className={styles.Save_Load_content_miniRen}>
            <img className={styles.Save_Load_content_miniRen_bg} alt="Save_img_preview" src={saveData.previewImage} />
          </div>
          <div className={styles.Save_Load_content_text}>
            <div className={styles.Save_Load_content_speaker + ' ' + styles.Load_content_speaker}>{speakerView}</div>
            <div className={styles.Save_Load_content_text_padding}>{easyCompile(saveData.nowStageState.showText)}</div>
          </div>
        </>
      );
    }
    showSaves.push(
      <div
        onClick={() => handleSlotAction(i)}
        onMouseEnter={playSeEnter}
        key={'loadElement_' + i}
        className={styles.Save_Load_content_element}
        style={{ animationDelay: `${animationIndex * 30}ms` }}
      >
        {saveElementContent}
      </div>,
    );
  }

  return (
    <div className={styles.Save_Load_main}>
      <div className={styles.Save_Load_top}>
        <div className={styles.Save_Load_title}>
          <div className={styles.Load_title_text}>{t('loadSaving.title')}</div>
        </div>
        <div className={styles.Save_Load_top_buttonList}>{page}</div>
      </div>
      <div className={styles.Save_Load_content} id={'Load_content_page_' + slPage}>
        {showSaves}
      </div>
    </div>
  );
};
