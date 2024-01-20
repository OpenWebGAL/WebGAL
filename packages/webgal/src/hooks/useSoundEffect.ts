import { setStage } from '@/store/stageReducer';

import page_flip_1 from '@/assets/se/page-flip-1.mp3';
import switch_1 from '@/assets/se/switch-1.mp3';
import mouse_enter from '@/assets/se/mouse-enter.mp3';
import dialog_se from '@/assets/se/dialog.mp3';
import click_se from '@/assets/se/click.mp3';
import { useDispatch } from 'react-redux';
import { webgalStore } from '@/store/store';

/**
 * 调用音效
 */
const useSoundEffect = () => {
  const dispatch = useDispatch();

  const playSeEnter = () => {
    dispatch(setStage({ key: 'uiSe', value: mouse_enter }));
  };
  const playSeClick = () => {
    dispatch(setStage({ key: 'uiSe', value: click_se }));
  };
  const playSeSwitch = () => {
    dispatch(setStage({ key: 'uiSe', value: switch_1 }));
  };
  const playSePageChange = () => {
    dispatch(setStage({ key: 'uiSe', value: page_flip_1 }));
  };

  const playSeDialogOpen = () => {
    dispatch(setStage({ key: 'uiSe', value: dialog_se }));
  };

  return {
    playSeEnter,
    playSeClick,
    playSePageChange,
    playSeDialogOpen,
    playSeSwitch,
  };
};

/**
 * 调用音效（只供 choose.tsx 使用）
 */
export const useSEByWebgalStore = () => {
  const playSeEnter = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: mouse_enter }));
  };
  const playSeClick = () => {
    webgalStore.dispatch(setStage({ key: 'uiSe', value: click_se }));
  };
  return {
    playSeEnter, // 鼠标进入
    playSeClick, // 鼠标点击
  };
};

export default useSoundEffect;
