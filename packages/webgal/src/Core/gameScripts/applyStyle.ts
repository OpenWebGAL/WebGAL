import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';

/**
 * 语句执行的模板代码
 * @param sentence
 */
export const applyStyle = (sentence: ISentence): IPerform => {
  const { content } = sentence;
  const applyStyleSegments = content.split(',');
  for (const applyStyleSegment of applyStyleSegments) {
    const splitSegment = applyStyleSegment.split('->');
    if (splitSegment.length >= 2) {
      const classNameToBeChange = splitSegment[0];
      const classNameChangeTo = splitSegment[1];
      stageStateManager.replaceUIlable([classNameToBeChange, classNameChangeTo]);
    }
  }
  return createNonePerform();
};
