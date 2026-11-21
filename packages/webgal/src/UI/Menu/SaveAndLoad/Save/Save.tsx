import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveGame } from '@/Core/controller/storage/saveGame';
import { getSavesFromStorage } from '@/Core/controller/storage/savesController';
import { setStorage } from '@/Core/controller/storage/storageController';
import useSoundEffect from '@/hooks/useSoundEffect';
import useTrans from '@/hooks/useTrans';
import { MENU_BUILTIN_SCREENS } from '@/screens/menu';
import { SaveSlotData } from '@/screens/contracts';
import { registerBuiltInScreens } from '@/screens/screenRegistry';
import { ScreenSlotRenderer } from '@/screens/ScreenSlotRenderer';
import { useUiCommonProps } from '@/screens/stage/shared';
import { getMockSaveSlots, useUiMockDataEnabled } from '@/sdk/mockData';
import { RootState } from '@/store/store';
import { setSlPage } from '@/store/userDataReducer';
import { showGlogalDialog } from '@/UI/GlobalDialog/GlobalDialog';
import { getMaxSaveSlotIndexFromStorage } from '@/UI/Menu/SaveAndLoad/saveStorageHelpers';

registerBuiltInScreens(MENU_BUILTIN_SCREENS);

export interface SaveConnectorProps {
  visible?: boolean;
}

export const Save: FC<SaveConnectorProps> = ({ visible = true }) => {
  const { playSePageChange, playSeDialogOpen } = useSoundEffect();
  const userDataState = useSelector((state: RootState) => state.userData);
  const savesDataState = useSelector((state: RootState) => state.saveData);
  const dispatch = useDispatch();
  const t = useTrans('menu.');
  const tCommon = useTrans('common.');
  const mockDataEnabled = useUiMockDataEnabled();
  const uiCommon = useUiCommonProps();
  const [loadedRange, setLoadedRange] = useState({ start: 1, end: 12 });

  const slPage = userDataState.optionData.slPage;

  useEffect(() => {
    if (!visible || mockDataEnabled) return;
    void getMaxSaveSlotIndexFromStorage().then((maxIdx) => {
      if (maxIdx > 0) {
        void getSavesFromStorage(maxIdx, maxIdx);
      }
    });
  }, [visible, mockDataEnabled]);

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
      if (savesDataState.saveData[index]) {
        playSeDialogOpen();
        showGlogalDialog({
          title: t('saving.isOverwrite'),
          leftText: tCommon('yes'),
          rightText: tCommon('no'),
          leftFunc: () => {
            saveGame(index);
            setStorage();
          },
          rightFunc: () => {},
        });
      } else {
        playSePageChange();
        saveGame(index);
      }
    },
    [mockDataEnabled, playSeDialogOpen, playSePageChange, savesDataState.saveData, t, tCommon],
  );

  const savesByIndex = useMemo(() => {
    if (mockDataEnabled) {
      return getMockSaveSlots(loadedRange.start, loadedRange.end);
    }
    const map: Record<number, SaveSlotData | null | undefined> = {};
    for (const [key, item] of Object.entries(savesDataState.saveData)) {
      const idx = Number(key);
      if (Number.isInteger(idx) && idx >= 0) {
        map[idx] = item;
      }
    }
    return map;
  }, [mockDataEnabled, loadedRange.start, loadedRange.end, savesDataState.saveData]);

  return (
    <ScreenSlotRenderer
      screen="save"
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
};
