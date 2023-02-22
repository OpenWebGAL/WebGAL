import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/controller/perform/performInterface';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { updateCurrentEffects } from '../controller/stage/pixi/PixiController';
import cloneDeep from 'lodash/cloneDeep';

/**
 * 更改立绘
 * @param sentence 语句
 */
export const changeFigure = (sentence: ISentence): IPerform => {
  // 根据参数设置指定位置
  let pos: 'center' | 'left' | 'right' = 'center';
  let content = sentence.content;
  let isFreeFigure = false;
  let key = '';
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
    if (e.key === 'id') {
      isFreeFigure = true;
      key = e.value.toString();
    }
    if (content === 'none') {
      content = '';
    }
  }
  const dispatch = webgalStore.dispatch;

  /**
   * 删掉相关 Effects，因为已经移除了
   */
  const prevEffects = webgalStore.getState().stage.effects;
  const newEffects = cloneDeep(prevEffects);
  const index = newEffects.findIndex((e) => e.target === `fig-${pos}${key}`);
  if (index >= 0) {
    newEffects.splice(index, 1);
  }
  updateCurrentEffects(newEffects);
  if (isFreeFigure) {
    const currentFreeFigures = webgalStore.getState().stage.freeFigure;

    /**
     * 重设
     */
    const index = currentFreeFigures.findIndex((figure) => figure.key === key);
    const newFreeFigure = cloneDeep(currentFreeFigures);
    if (index >= 0) {
      // if (content === '') {
      //   // 移除
      //   newFreeFigure.splice(index, 1);
      // } else {
      newFreeFigure[index].basePosition = pos;
      newFreeFigure[index].name = content;
      // }
    } else {
      // 新加
      if (content !== '') newFreeFigure.push({ key, name: content, basePosition: pos });
    }
    dispatch(setStage({ key: 'freeFigure', value: newFreeFigure }));
  } else
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
