import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CloseSmall } from '@icon-park/react';
import styles from './extra.module.scss';
import useSoundEffect from '@/hooks/useSoundEffect';
import useTrans from '@/hooks/useTrans';
import { MENU_BUILTIN_SCREENS } from '@/screens/menu';
import { registerBuiltInScreens } from '@/screens/screenRegistry';
import { ScreenSlotRenderer } from '@/screens/ScreenSlotRenderer';
import { useIsCustomUiTemplate, useUiCommonProps } from '@/screens/stage/shared';
import { getMockExtraData, useUiMockDataEnabled } from '@/sdk/mockData';
import { setGuiAsset, setVisibility } from '@/store/GUIReducer';
import { RootState } from '@/store/store';
import { ExtraBgm } from '@/UI/Extra/ExtraBgm';
import { buildGroupedCgList, ExtraCg } from './ExtraCg';

registerBuiltInScreens(MENU_BUILTIN_SCREENS);

export function Extra() {
  const { playSeClick } = useSoundEffect();
  const showExtra = useSelector((state: RootState) => state.GUI.showExtra);
  const titleBgm = useSelector((state: RootState) => state.GUI.titleBgm);
  const appreciationData = useSelector((state: RootState) => state.userData.appreciationData);
  const dispatch = useDispatch();
  const t = useTrans('extra.');
  const isCustomUi = useIsCustomUiTemplate();
  const mockDataEnabled = useUiMockDataEnabled();
  const uiCommon = useUiCommonProps();
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);

  useEffect(() => {
    const audio = document.getElementById('currentBgm') as HTMLAudioElement | null;
    if (!audio) return;
    const syncState = () => setIsBgmPlaying(!audio.paused && !audio.ended);
    syncState();
    audio.addEventListener('play', syncState);
    audio.addEventListener('pause', syncState);
    audio.addEventListener('ended', syncState);
    return () => {
      audio.removeEventListener('play', syncState);
      audio.removeEventListener('pause', syncState);
      audio.removeEventListener('ended', syncState);
    };
  }, [titleBgm, showExtra]);

  const { cgGroups, bgmList } = useMemo(() => {
    if (mockDataEnabled) {
      return getMockExtraData();
    }
    return {
      cgGroups: buildGroupedCgList(appreciationData.cg),
      bgmList: appreciationData.bgm,
    };
  }, [mockDataEnabled, appreciationData.cg, appreciationData.bgm]);

  const currentTrackIndex = useMemo(() => bgmList.findIndex((item) => item.url === titleBgm), [bgmList, titleBgm]);

  const selectBgmUrl = useCallback(
    (url: string) => {
      if (mockDataEnabled) return;
      dispatch(setGuiAsset({ asset: 'titleBgm', value: url }));
    },
    [dispatch, mockDataEnabled],
  );

  const handleTogglePlay = useCallback(() => {
    if (mockDataEnabled) {
      setIsBgmPlaying((prev) => !prev);
      return;
    }
    const audio = document.getElementById('currentBgm') as HTMLAudioElement | null;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  }, [mockDataEnabled]);

  const handleStepBgm = useCallback(
    (delta: number) => {
      if (bgmList.length === 0) return;
      const baseIndex = currentTrackIndex < 0 ? 0 : currentTrackIndex;
      const nextIndex = (baseIndex + delta + bgmList.length) % bgmList.length;
      selectBgmUrl(bgmList[nextIndex].url);
    },
    [bgmList, currentTrackIndex, selectBgmUrl],
  );

  if (isCustomUi) {
    return (
      <ScreenSlotRenderer
        screen="extra"
        screenProps={{
          visible: showExtra,
          cgGroups,
          bgmList,
          currentBgmUrl: titleBgm,
          isBgmPlaying,
          onSelectBgm: selectBgmUrl,
          onToggleBgmPlay: handleTogglePlay,
          onPrevBgm: () => handleStepBgm(-1),
          onNextBgm: () => handleStepBgm(1),
          onClose: () => dispatch(setVisibility({ component: 'showExtra', visibility: false })),
          ...uiCommon,
        }}
      />
    );
  }

  return (
    <>
      {showExtra && (
        <div className={styles.extra}>
          <div className={styles.extra_top}>
            <CloseSmall
              className={styles.extra_top_icon}
              onClick={() => {
                dispatch(setVisibility({ component: 'showExtra', visibility: false }));
                playSeClick();
              }}
              onMouseEnter={playSeClick}
              theme="outline"
              size="4em"
              fill="#fff"
              strokeWidth={3}
            />
            <div className={styles.extra_title}>{t('title')}</div>
          </div>
          <div className={styles.mainContainer}>
            <ExtraCg />
            <ExtraBgm />
          </div>
        </div>
      )}
    </>
  );
}
