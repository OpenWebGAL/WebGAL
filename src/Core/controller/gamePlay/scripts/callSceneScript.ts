import { ISentence } from '@/Core/interface/coreInterface/sceneInterface';
import { IPerform } from '@/Core/interface/coreInterface/performInterface';
import { callScene } from '../../scene/callScene';

/**
 * 调用一个场景，在场景结束后回到调用这个场景的父场景。
 * @param sentence
 */
export const callSceneScript = (sentence: ISentence): IPerform => {
  const sceneNameArray: Array<string> = sentence.content.split('/');
  const sceneName = sceneNameArray[sceneNameArray.length - 1];
  callScene(sentence.content, sceneName);
  return {
    performName: 'none',
    duration: 0,
    isOver: false,
    isHoldOn: true,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
