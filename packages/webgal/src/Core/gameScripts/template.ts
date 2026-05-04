import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';

/**
 * 语句执行的模板代码
 * @param sentence
 */
export const template = (sentence: ISentence): IPerform => {
  return createNonePerform();
};
