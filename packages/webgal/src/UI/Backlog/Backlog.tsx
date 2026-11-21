import { jumpFromBacklog } from '@/Core/controller/storage/jumpFromBacklog';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, webgalStore } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { useEffect, useRef, useState } from 'react';
import { WebGAL } from '@/Core/WebGAL';
import { stopAuto } from '@/Core/controller/gamePlay/autoPlay';
import { ScreenSlotRenderer } from '@/screens/ScreenSlotRenderer';
import { useUiCommonProps } from '@/screens/stage/shared';
import { getMockBacklogItems, useUiMockDataEnabled } from '@/sdk/mockData';

export const Backlog = () => {
  const GUIStore = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();
  const mockDataEnabled = useUiMockDataEnabled();
  const uiCommon = useUiCommonProps();
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (GUIStore.showBacklog) {
      stopAuto();
    } else {
      setPlayingIndex(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [GUIStore.showBacklog]);

  const rawBacklog = WebGAL.backlogManager.getBacklog();
  const realItems = [];
  for (let i = rawBacklog.length - 1; i >= 0; i--) {
    const entry = rawBacklog[i];
    realItems.push({
      index: i,
      speaker: entry.currentStageState.showName,
      text: entry.currentStageState.showText,
      vocalUrl: entry.currentStageState.vocal,
      sentenceId: entry.saveScene.currentSentenceId,
    });
  }
  const items = mockDataEnabled ? getMockBacklogItems() : realItems;

  const handleToggleVocal = (index: number) => {
    const target = items.find((item) => item.index === index);
    if (!target || !target.vocalUrl || !audioRef.current) return;

    const currentVocal = document.getElementById('currentVocal') as HTMLAudioElement | null;
    if (currentVocal) {
      currentVocal.pause();
      currentVocal.currentTime = 0;
    }
    WebGAL.gameplay.performController.unmountPerform('vocal-play', true);

    const audio = audioRef.current;
    if (playingIndex === index && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
      setPlayingIndex(null);
      return;
    }

    const { optionData } = webgalStore.getState().userData;
    audio.src = target.vocalUrl;
    audio.currentTime = 0;
    audio.volume = optionData.volumeMain * 0.01 * optionData.vocalVolume * 0.01;
    setPlayingIndex(index);
    void audio.play();
  };

  return (
    <>
      <ScreenSlotRenderer
        screen="backlog"
        screenProps={{
          visible: GUIStore.showBacklog,
          items,
          playingIndex,
          onJump: (index) => {
            if (mockDataEnabled) return;
            jumpFromBacklog(index);
          },
          onToggleVocal: handleToggleVocal,
          onClose: () => {
            dispatch(setVisibility({ component: 'showBacklog', visibility: false }));
            dispatch(setVisibility({ component: 'showTextBox', visibility: true }));
          },
          scrollContainerAttr: 'data-webgal-backlog-scroll',
          ...uiCommon,
        }}
      />
      <audio ref={audioRef} onEnded={() => setPlayingIndex(null)} />
    </>
  );
};
