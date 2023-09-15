import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { say } from '../../gameScripts/say';
import { initPerform, IPerform } from '@/Core/Modules/perform/performInterface';

import { WebGAL } from '@/Core/WebGAL';
import { SCRIPT_CONFIG } from '@/Core/parser/sceneParser';

/**
 * 规范函数的类型
 * @type {(sentence: ISentence) => IPerform}
 */
type scriptFunction = (sentence: ISentence) => IPerform;

/**
 * 语句调用器，真正执行语句的调用，并自动将演出在指定时间卸载
 * @param script 调用的语句
 */
export const runScript = (script: ISentence) => {
  let perform: IPerform = initPerform;
  let funcToRun: scriptFunction = say; // 默认是say

  // 建立语句类型到执行函数的映射
  const scriptToFuncMap = new Map();
  SCRIPT_CONFIG.forEach((e) => {
    scriptToFuncMap.set(e.scriptType, e.scriptFunction);
  });

  // 根据脚本类型切换函数
  if (scriptToFuncMap.has(script.command)) {
    funcToRun = scriptToFuncMap.get(script.command) as scriptFunction;
  }

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
