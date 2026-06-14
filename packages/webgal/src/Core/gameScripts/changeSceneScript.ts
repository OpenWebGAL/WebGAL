import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { changeScene } from '../controller/scene/changeScene';

/**
 * 切换场景。在场景结束后不会回到父场景。
 * @param sentence
 */
export const changeSceneScript = (sentence: ISentence): IPerform => {
  const sceneNameArray: Array<string> = sentence.content.split('/');
  const sceneName = sceneNameArray[sceneNameArray.length - 1];
  // 从 args 中提取场景参数
  const params: Record<string, any> = {};
  sentence.args.forEach((arg) => {
    if (arg.key.startsWith('@')) {
      params[arg.key.slice(1)] = arg.value;
    }
  });
  changeScene(sentence.content, sceneName, params);
  return createNonePerform({ isHoldOn: true });
};
