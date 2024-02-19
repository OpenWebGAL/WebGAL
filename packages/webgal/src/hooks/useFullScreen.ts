import { RootState } from '@/store/store';
import { fullScreenOption } from '@/store/userDataInterface';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export function useFullScreen() {
  const userDataState = useSelector((state: RootState) => state.userData);
  const GUIState = useSelector((state: RootState) => state.GUI);
  const fullScreen = userDataState.optionData.fullScreen;
  const isEnterGame = GUIState.isEnterGame;

  useEffect(() => {
    switch (fullScreen) {
      case fullScreenOption.yes: {
        if (isEnterGame) {
          document.documentElement.requestFullscreen();
        };
        break;
      }
      case fullScreenOption.no: {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        };
        break;
      }
    }
  }, [fullScreen]);
};
