import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { jmp } from '@/Core/gameScripts/label/jmp';

/**
 * 跳转到指定标签
 * @param sentence
 */
export const jumpLabel = (sentence: ISentence): IPerform => {
  jmp(sentence.content);
  return createNonePerform();
};
