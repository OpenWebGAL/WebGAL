import { setStorage } from '@/Core/controller/storage/storageController';
import { RootState } from '@/store/store';
import { fullScreenOption } from '@/store/userDataInterface';
import { setOptionData } from '@/store/userDataReducer';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { keyboard } from './useHotkey';

export function useFullScreen() {
  const userDataState = useSelector((state: RootState) => state.userData);
  const GUIState = useSelector((state: RootState) => state.GUI);
  const dispatch = useDispatch();
  const fullScreen = userDataState.optionData.fullScreen;
  const isEnterGame = GUIState.isEnterGame;
  let currentWindowHeight = window.innerHeight;

  useEffect(() => {
    switch (fullScreen) {
      case fullScreenOption.on: {
        if (isEnterGame) {
          document.documentElement.requestFullscreen();
          if (keyboard) keyboard.lock(['Escape', 'F11']);
        };
        break;
      }
      case fullScreenOption.off: {
        if (document.fullscreenElement) {
          document.exitFullscreen();
          if (keyboard) keyboard.unlock();
        };
        break;
      }
    }
  }, [fullScreen]);

  /**
   * 通过窗口高度变化判断是否退出全屏，并更改全屏状态
   */
  useEffect(() => {
    const isExitingFullScreen = () => {
      if (
        fullScreen === fullScreenOption.on &&
        isEnterGame &&
        currentWindowHeight > window.innerHeight &&
        currentWindowHeight !== window.innerWidth // 防止旋转屏幕时退出全屏
      ) {
        dispatch(setOptionData({ key: 'fullScreen', value: fullScreenOption.off }));
        setStorage();
      }
      currentWindowHeight = window.innerHeight;
    };
    window.addEventListener('resize', isExitingFullScreen);
    return () => {
      window.removeEventListener('resize', isExitingFullScreen);
    };
  }, [fullScreen, currentWindowHeight]);
};
