// 切换自动播放状态
import { stopAuto } from './autoPlay';
import styles from '@/UI/BottomControlPanel/bottomControlPanel.module.scss';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';

import { WebGAL } from '@/Core/WebGAL';
import { SYSTEM_CONFIG } from '@/config';

/**
 * 设置 fast 按钮的激活与否
 * @param on
 */
const setButton = (on: boolean) => {
  const autoIcon = document.getElementById('Button_ControlPanel_fast');
  if (autoIcon) {
    if (on) {
      autoIcon.className = styles.button_on;
    } else autoIcon.className = styles.singleButton;
  }
};

export { setButton as setFastButton };

/**
 * 停止快进模式
 */
export const stopFast = () => {
  if (!isFast()) {
    return;
  }
  WebGAL.gameplay.isFast = false;
  setButton(false);
  if (WebGAL.gameplay.fastInterval !== null) {
    clearInterval(WebGAL.gameplay.fastInterval);
    WebGAL.gameplay.fastInterval = null;
  }
};

/**
 * 开启快进
 */
export const startFast = () => {
  if (isFast()) {
    return;
  }
  WebGAL.gameplay.isFast = true;
  setButton(true);
  WebGAL.gameplay.fastInterval = setInterval(() => {
    nextSentence();
  }, SYSTEM_CONFIG.fast_timeout);
};

// 判断是否是快进模式
export const isFast = function () {
  return WebGAL.gameplay.isFast;
};

/**
 * 停止快进模式与自动播放
 */
export const stopAll = () => {
  stopFast();
  stopAuto();
};

/**
 * 切换快进模式
 */
export const switchFast = () => {
  // 现在正在快进
  if (WebGAL.gameplay.isFast) {
    stopFast();
  } else {
    // 当前不在快进
    startFast();
  }
};
