// import {logger} from '../../util/logger';
import styles from '@/UI/BottomControlPanel/bottomControlPanel.module.scss';
import { webgalStore } from '@/store/store';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';

import { WebGAL } from '@/Core/WebGAL';

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
  WebGAL.gameplay.isAuto = false;
  setButton(false);
  if (WebGAL.gameplay.autoInterval !== null) {
    clearInterval(WebGAL.gameplay.autoInterval);
    WebGAL.gameplay.autoInterval = null;
  }
  if (WebGAL.gameplay.autoTimeout !== null) {
    clearTimeout(WebGAL.gameplay.autoTimeout);
    WebGAL.gameplay.autoTimeout = null;
  }
};

/**
 * 切换自动播放状态
 */
export const switchAuto = () => {
  // 现在正在自动播放
  if (WebGAL.gameplay.isAuto) {
    stopAuto();
  } else {
    // 当前不在自动播放
    WebGAL.gameplay.isAuto = true;
    setButton(true);
    WebGAL.gameplay.autoInterval = setInterval(autoPlay, 100);
  }
};

export const autoNextSentence = () => {
  nextSentence();
  WebGAL.gameplay.autoTimeout = null;
};

/**
 * 自动播放的执行函数
 */
const autoPlay = () => {
  const data = webgalStore.getState().userData.optionData.autoSpeed;
  // 范围为 [250, 1750]
  const autoPlayDelay = 250 + (100 - data) * 15;
  let isBlockingAuto = false;
  WebGAL.gameplay.performController.performList.forEach((e) => {
    if (e.blockingAuto())
      // 阻塞且没有结束的演出
      isBlockingAuto = true;
  });
  if (isBlockingAuto) {
    // 有阻塞，提前结束
    return;
  }
  // nextSentence();
  if (WebGAL.gameplay.autoTimeout === null) {
    WebGAL.gameplay.autoTimeout = setTimeout(autoNextSentence, autoPlayDelay);
  }
};
