import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/controller/perform/performInterface';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';

/**
 * 更改立绘
 * @param sentence 语句
 */
export const changeFigure = (sentence: ISentence): IPerform => {
  // 根据参数设置指定位置
  let pos = 'center';
  let content = sentence.content;
  for (const e of sentence.args) {
    if (e.key === 'left' && e.value === true) {
      pos = 'left';
    }
    if (e.key === 'right' && e.value === true) {
      pos = 'right';
    }
    if (e.key === 'clear' && e.value === true) {
      content = '';
    }
    if (content === 'none') {
      content = '';
    }
  }
  const dispatch = webgalStore.dispatch;
  switch (pos) {
    case 'center':
      dispatch(setStage({ key: 'figName', value: content }));
      break;
    case 'left':
      dispatch(setStage({ key: 'figNameLeft', value: content }));
      break;
    case 'right':
      dispatch(setStage({ key: 'figNameRight', value: content }));
      break;
  }
  return {
    performName: 'none',
    duration: 0,
    isOver: false,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => false,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
