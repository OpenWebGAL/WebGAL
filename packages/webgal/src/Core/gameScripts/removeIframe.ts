import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { getBooleanArgByKey } from '../util/getSentenceArg';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';

/**
 * 移除框架
 * @param sentence
 */
export const removeIframe = (sentence: ISentence): IPerform => {
  const id = sentence.content;
  const hideOnly = getBooleanArgByKey(sentence, 'save') ?? false;
  if (!id) {
    return {
      performName: 'none',
      duration: 0,
      isHoldOn: false,
      stopFunction: () => {},
      blockingNext: () => false,
      blockingAuto: () => true,
    };
  }

  stageStateManager.removeIframe({ id, save: hideOnly });

  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
  };
};
