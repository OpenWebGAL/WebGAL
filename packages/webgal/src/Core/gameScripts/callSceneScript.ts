import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { callScene } from '../controller/scene/callScene';

/**
 * 调用一个场景，在场景结束后回到调用这个场景的父场景。
 * @param sentence
 */
export const callSceneScript = (sentence: ISentence): IPerform => {
  const sceneNameArray: Array<string> = sentence.content.split('/');
  const sceneName = sceneNameArray[sceneNameArray.length - 1];
  callScene(sentence.content, sceneName);
  return createNonePerform({ isHoldOn: true });
};
