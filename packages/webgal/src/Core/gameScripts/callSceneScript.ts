import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { IGameVar } from '@/Core/Modules/stage/stageInterface';
import { callScene } from '../controller/scene/callScene';

/**
 * 还原参数值的类型。参数经过变量插值后恒为字符串，这里按解析器的规则重新判定。
 * @see packages/parser/src/scriptParser/argsParser.ts
 */
const restoreArgValueType = (value: string | boolean | number) => {
  if (typeof value !== 'string') return value;
  if (value === 'true' || value === 'false') return value === 'true';
  if (!isNaN(Number(value))) return Number(value);
  return value;
};

/**
 * 调用一个场景，在场景结束后回到调用这个场景的父场景。
 * @param sentence
 */
export const callSceneScript = (sentence: ISentence): IPerform => {
  const sceneNameArray: Array<string> = sentence.content.split('/');
  const sceneName = sceneNameArray[sceneNameArray.length - 1];
  // 所有参数原样成为被调用场景的局部变量，包括 when、next 等通用参数，子场景用不用随意
  const locals: IGameVar = {};
  let writeReturnTo: string | undefined;
  sentence.args.forEach(({ key, value }) => {
    locals[key] = restoreArgValueType(value);
    if (key === 'writeReturnTo' && typeof value === 'string') {
      writeReturnTo = value;
    }
  });
  callScene(sentence.content, sceneName, locals, writeReturnTo);
  return createNonePerform({ isHoldOn: true });
};
