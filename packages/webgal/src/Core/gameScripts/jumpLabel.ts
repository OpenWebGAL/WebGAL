import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { jmp } from '@/Core/gameScripts/label/jmp';
import type { IStageCommitOptions } from '@/Core/Modules/stage/stageStateManager';

/**
 * 跳转到指定标签
 * @param sentence
 */
export const jumpLabel = (sentence: ISentence, commitOptions: IStageCommitOptions = {}): IPerform => {
  jmp(sentence.content, true, commitOptions);
  return createNonePerform();
};
