import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';

/**
 * 标签代码，什么也不做
 * @param sentence
 */
export const label = (sentence: ISentence): IPerform => {
  return createNonePerform();
};
