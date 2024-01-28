import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { initPerform, IPerform } from '@/Core/Modules/perform/performInterface';

import { WebGAL } from '@/Core/WebGAL';
import { scriptRegistry, SCRIPT_TAG_MAP, ScriptFunction } from '@/Core/parser/sceneParser';

/**
 * 语句调用器，真正执行语句的调用，并自动将演出在指定时间卸载
 * @param script 调用的语句
 */
export const runScript = (script: ISentence) => {
  let perform: IPerform = initPerform;
  const funcToRun: ScriptFunction = scriptRegistry[script.command]?.scriptFunction ?? SCRIPT_TAG_MAP.say.scriptFunction; // 默认是say

  // 调用脚本对应的函数
  perform = funcToRun(script);

  if (perform.arrangePerformPromise) {
    perform.arrangePerformPromise.then((resolovedPerform) =>
      WebGAL.gameplay.performController.arrangeNewPerform(resolovedPerform, script),
    );
  } else {
    WebGAL.gameplay.performController.arrangeNewPerform(perform, script);
  }
};
