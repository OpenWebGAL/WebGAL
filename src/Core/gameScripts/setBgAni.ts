import {ISentence} from '@/Core/interface/coreInterface/sceneInterface';
import {IPerform} from '@/Core/interface/coreInterface/performInterface';

/**
 * 设置背景动画
 * @param sentence
 */
export const setBgAni = (sentence: ISentence): IPerform => {
  const content = sentence.content;
  setTimeout(() => {
    const mainBg = document.getElementById('MainStage_bg_MainContainer');
    if (mainBg) {
      mainBg.style.animation = 'none';
      setTimeout(() => {
        mainBg.style.animation = content;
      }, 1);
    }
  }, 50);
  return {
    performName: 'bgAni',
    duration: 0,
    isOver: false,
    isHoldOn: false,
    stopFunction: () => {
    },
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
