import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';

/**
 * 设置背景效果
 * @param sentence
 */
export const setFilter = (sentence: ISentence): IPerform => {
  return createNonePerform();
};
