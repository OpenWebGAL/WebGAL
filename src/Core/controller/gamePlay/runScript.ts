import {ISentence} from '@/interface/coreInterface/sceneInterface';
import {say} from '../../gameScripts/say';
import {initPerform, IPerform} from '@/interface/coreInterface/performInterface';
import {unmountPerform} from '../perform/unmountPerform';
import {runtime_gamePlay} from '../../runtime/gamePlay';
import {webgalStore} from "@/Core/store/store";
import {resetStageState} from '@/Core/store/stageReducer';
import {nextSentence} from "@/Core/controller/gamePlay/nextSentence";
import cloneDeep from 'lodash/cloneDeep';
import {scriptConfig} from "@/Core/config/scriptConfig";

/**
 * 规范函数的类型
 * @type {(sentence: ISentence) => IPerform}
 */
type scriptFunction = (sentence: ISentence) => IPerform

/**
 * 语句调用器，真正执行语句的调用，并自动将演出在指定时间卸载
 * @param script 调用的语句
 */
export const runScript = (script: ISentence) => {
  let perform: IPerform = initPerform;
  let funcToRun: scriptFunction = say; // 默认是say

  // 建立语句类型到执行函数的映射
  const scriptToFuncMap = new Map();
  scriptConfig.forEach(e => {
    scriptToFuncMap.set(e.scriptType, e.scriptFunction);
  });

  // 根据脚本类型切换函数
  if (scriptToFuncMap.has(script.command)) {
    funcToRun = scriptToFuncMap.get(script.command) as scriptFunction;
  }

  // 调用脚本对应的函数
  perform = funcToRun(script);

  // 语句不执行演出
  if (perform.performName === 'none') {
    return;
  }

  // 同步演出状态
  const stageState = webgalStore.getState().stage;
  const newStageState = cloneDeep(stageState);
  newStageState.PerformList.push({isHoldOn: perform.isHoldOn, script: script});
  webgalStore.dispatch(resetStageState(newStageState));

  // 时间到后自动清理演出
  perform.stopTimeout = setTimeout(() => {
    // perform.stopFunction();
    perform.isOver = true;
    if (!perform.isHoldOn) {
      // 如果不是保持演出，清除
      unmountPerform(perform.performName);
      if (perform.goNextWhenOver) {
        nextSentence();
      }
    }
  }, perform.duration);

  runtime_gamePlay.performList.push(perform);
};
