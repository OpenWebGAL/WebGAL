import { RUNTIME_GAMEPLAY } from '../../runtime/gamePlay';
// import {logger} from '../../util/logger';
import styles from '../../../Components/UI/BottomControlPanel/bottomControlPanel.module.scss';
import { webgalStore } from '@/store/store';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';

/**
 * 设置 autoplay 按钮的激活与否
 * @param on
 */
const setButton = (on: boolean) => {
  const autoIcon = document.getElementById('Button_ControlPanel_auto');
  if (autoIcon) {
    if (on) {
      autoIcon.className = styles.button_on;
    } else autoIcon.className = styles.singleButton;
  }
};

/**
 * 停止自动播放
 */
export const stopAuto = () => {
  RUNTIME_GAMEPLAY.isAuto = false;
  setButton(false);
  if (RUNTIME_GAMEPLAY.autoInterval !== null) {
    clearInterval(RUNTIME_GAMEPLAY.autoInterval);
    RUNTIME_GAMEPLAY.autoInterval = null;
  }
  if (RUNTIME_GAMEPLAY.autoTimeout !== null) {
    clearTimeout(RUNTIME_GAMEPLAY.autoTimeout);
    RUNTIME_GAMEPLAY.autoTimeout = null;
  }
};

/**
 * 切换自动播放状态
 */
export const switchAuto = () => {
  // 现在正在自动播放
  if (RUNTIME_GAMEPLAY.isAuto) {
    stopAuto();
  } else {
    // 当前不在自动播放
    RUNTIME_GAMEPLAY.isAuto = true;
    setButton(true);
    RUNTIME_GAMEPLAY.autoInterval = setInterval(autoPlay, 100);
  }
};

export const autoNextSentence = () => {
  nextSentence();
  RUNTIME_GAMEPLAY.autoTimeout = null;
};

/**
 * 自动播放的执行函数
 */
const autoPlay = () => {
  const delay = webgalStore.getState().userData.optionData.autoSpeed;
  const autoPlayDelay = 750 - 250 * delay;
  let isBlockingAuto = false;
  RUNTIME_GAMEPLAY.performList.forEach((e) => {
    if (e.blockingAuto() && !e.isOver)
      // 阻塞且没有结束的演出
      isBlockingAuto = true;
  });
  if (isBlockingAuto) {
    // 有阻塞，提前结束
    return;
  }
  // nextSentence();
  if (RUNTIME_GAMEPLAY.autoTimeout === null) {
    RUNTIME_GAMEPLAY.autoTimeout = setTimeout(autoNextSentence, autoPlayDelay);
  }
};
