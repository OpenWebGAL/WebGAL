import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';

/**
 * 语句执行的模板代码
 * @param sentence
 */
export function setTextbox(sentence: ISentence): IPerform {
  if (sentence.content === 'hide') {
    stageStateManager.setStage('isDisableTextbox', true);
  } else {
    stageStateManager.setStage('isDisableTextbox', false);
  }
  return createNonePerform();
}
