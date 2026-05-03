import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';

/**
 * 显示小头像
 * @param sentence
 */
export const miniAvatar = (sentence: ISentence): IPerform => {
  let content = sentence.content;
  if (sentence.content === 'none' || sentence.content === '') {
    content = '';
  }
  stageStateManager.setStage('miniAvatar', content);
  return createNonePerform({ isHoldOn: true });
};
