// import {logger} from '../../util/logger';
import styles from '@/UI/BottomControlPanel/bottomControlPanel.module.scss';
import { webgalStore } from '@/store/store';
import { nextSentence } from '@/Core/controller/gamePlay/nextSentence';

import { WebGAL } from '@/Core/WebGAL';

/**
 * 设置 autoplay 按钮的激活与否
 * @param on
 */
export const setAutoButton = (on: boolean) => {
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
    WebGAL.gameplay.autoInterval = setInterval(autoPlay, 100);
  }
};

/**
 * 是否存在阻塞自动播放的演出
 */
const hasBlockingAutoPerform = () => WebGAL.gameplay.performController.performList.some((e) => e.blockingAuto());

export const autoNextSentence = () => {
  // 两次轮询之间可能出现了新的阻塞，到期时再确认一次
  if (!hasBlockingAutoPerform()) nextSentence();
  WebGAL.gameplay.autoTimeout = null;
};

/**
 * 自动播放的执行函数
 */
const autoPlay = () => {
  const data = webgalStore.getState().userData.optionData.autoSpeed;
  // 范围为 [250, 1750]
  const autoPlayDelay = 250 + (100 - data) * 15;
  if (hasBlockingAutoPerform()) {
    // 有阻塞：已定下的翻页依据的是上一句已显示完，现在前提失效，撤销后等阻塞结束重新计时
    if (WebGAL.gameplay.autoTimeout !== null) {
      clearTimeout(WebGAL.gameplay.autoTimeout);
      WebGAL.gameplay.autoTimeout = null;
    }
    return;
  }
  // nextSentence();
  if (WebGAL.gameplay.autoTimeout === null) {
    // 保留自动阅读的停留时间，到时再检查能否推进，不能同步连续跳句。
    WebGAL.gameplay.autoTimeout = setTimeout(autoNextSentence, autoPlayDelay);
  }
};
