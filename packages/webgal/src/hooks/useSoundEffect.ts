import page_flip_1 from '@/assets/se/page-flip-1.mp3';
import switch_1 from '@/assets/se/switch-1.mp3';
import mouse_enter from '@/assets/se/mouse-enter.mp3';
import dialog_se from '@/assets/se/dialog.mp3';
import click_se from '@/assets/se/click.mp3';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';

/**
 * 调用音效
 */
const useSoundEffect = () => {
  const playSeEnter = () => {
    stageStateManager.setStageAndCommit('uiSe', mouse_enter);
  };
  const playSeClick = () => {
    stageStateManager.setStageAndCommit('uiSe', click_se);
  };
  const playSeSwitch = () => {
    stageStateManager.setStageAndCommit('uiSe', switch_1);
  };
  const playSePageChange = () => {
    stageStateManager.setStageAndCommit('uiSe', page_flip_1);
  };

  const playSeDialogOpen = () => {
    stageStateManager.setStageAndCommit('uiSe', dialog_se);
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
    stageStateManager.setStageAndCommit('uiSe', mouse_enter);
  };
  const playSeClick = () => {
    stageStateManager.setStageAndCommit('uiSe', click_se);
  };
  return {
    playSeEnter, // 鼠标进入
    playSeClick, // 鼠标点击
  };
};

export default useSoundEffect;
