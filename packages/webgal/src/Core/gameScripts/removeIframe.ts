import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { stageActions } from '@/store/stageReducer';
import { webgalStore } from '@/store/store';
import { getBooleanArgByKey } from '../util/getSentenceArg';

/**
 * 移除框架
 * @param sentence
 */
export const removeIframe = (sentence: ISentence): IPerform => {
  const id = sentence.content;
  const save = getBooleanArgByKey(sentence, 'save') ?? false;
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

  webgalStore.dispatch(stageActions.removeIframe({ id, isActive: save }));

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
