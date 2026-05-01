import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';

/**
 * 语句执行的模板代码
 * @param sentence
 */
export const filmMode = (sentence: ISentence): IPerform => {
  if (sentence.content !== '' && sentence.content !== 'none') {
    stageStateManager.setStage('enableFilm', sentence.content);
  } else {
    stageStateManager.setStage('enableFilm', '');
  }
  return createNonePerform();
};
