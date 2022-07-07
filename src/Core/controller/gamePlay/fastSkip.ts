// 切换自动播放状态
import { runtime_gamePlay } from '../../runtime/gamePlay';
import { stopAuto } from './autoPlay';
import styles from '../../../Components/UI/BottomControlPanel/bottomControlPanel.module.scss';
import {nextSentence} from "@/Core/controller/gamePlay/nextSentence";

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

/**
 * 停止快进模式
 */
export const stopFast = () => {
  if (!isFast()) {
    return;
  }
  runtime_gamePlay.isFast = false;
  setButton(false);
  if (runtime_gamePlay.fastInterval !== null) {
    clearInterval(runtime_gamePlay.fastInterval);
    runtime_gamePlay.fastInterval = null;
  }
};

/**
 * 开启快进
 */
export const startFast = () => {
  if (isFast()) {
    return;
  }
  runtime_gamePlay.isFast = true;
  setButton(true);
  runtime_gamePlay.fastInterval = setInterval(() => {
    nextSentence();
  }, 100);
};

// 判断是否是快进模式
export const isFast = function () {
  return runtime_gamePlay.isFast;
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
  if (runtime_gamePlay.isFast) {
    stopFast();
  } else {
    // 当前不在快进
    startFast();
  }
};


