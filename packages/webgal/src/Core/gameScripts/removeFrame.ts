import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { stageActions } from '@/store/stageReducer';
import { webgalStore } from '@/store/store';

/**
 * 移除框架
 * @param sentence
 */
export const removeFrame = (sentence: ISentence): IPerform => {
  const id = sentence.content;
  if (!id) {
    return {
      performName: 'none',
      duration: 0,
      isHoldOn: false,
      stopFunction: () => {},
      blockingNext: () => false,
      blockingAuto: () => true,
      stopTimeout: undefined,
    };
  }
  webgalStore.dispatch(stageActions.removeFrame(id));

  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined,
  };
};
