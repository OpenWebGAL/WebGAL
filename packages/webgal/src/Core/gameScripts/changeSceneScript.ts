import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { changeScene } from '../controller/scene/changeScene';
import type { IStageCommitOptions } from '@/Core/Modules/stage/stageStateManager';

/**
 * 切换场景。在场景结束后不会回到父场景。
 * @param sentence
 */
export const changeSceneScript = (sentence: ISentence, commitOptions: IStageCommitOptions = {}): IPerform => {
  const sceneNameArray: Array<string> = sentence.content.split('/');
  const sceneName = sceneNameArray[sceneNameArray.length - 1];
  changeScene(sentence.content, sceneName, commitOptions);
  return createNonePerform({ isHoldOn: true });
};
