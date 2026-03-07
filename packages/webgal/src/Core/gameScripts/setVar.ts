import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { setStageVar } from '@/store/stageReducer';
import { logger } from '@/Core/util/logger';
import { setScriptManagedGlobalVar } from '@/store/userDataReducer';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { ISetGameVar } from '@/store/stageInterface';
import { dumpToStorageFast } from '@/Core/controller/storage/storageController';
import { getBooleanArgByKey } from '../util/getSentenceArg';
import { EvaluateExpression } from '../util/evalSentenceFn';

/**
 * 设置变量
 * @param sentence
 */
export const setVar = (sentence: ISentence): IPerform => {
  let setGlobal = getBooleanArgByKey(sentence, 'global') ?? false;
  let targetReducerFunction: ActionCreatorWithPayload<ISetGameVar, string>;
  if (setGlobal) {
    targetReducerFunction = setScriptManagedGlobalVar;
  } else {
    targetReducerFunction = setStageVar;
  }
  // 先把表达式拆分为变量名和赋值语句
  if (sentence.content.match(/\s*=\s*/)) {
    const key = sentence.content.split(/\s*=\s*/)[0];
    const valExp = sentence.content.split(/\s*=\s*/)[1];
    if (valExp.length === 0) {
      webgalStore.dispatch(targetReducerFunction({ key, value: '' }));
    } else if (!isNaN(Number(valExp))) {
      webgalStore.dispatch(targetReducerFunction({ key, value: Number(valExp) }));
    } else {
      webgalStore.dispatch(
        targetReducerFunction({ key, value: EvaluateExpression(valExp, { InvalidValueReturns: 'origin' }) }),
      );
    }
    if (setGlobal) {
      logger.debug('设置全局变量：', { key, value: webgalStore.getState().userData.globalGameVar[key] });
      dumpToStorageFast();
    } else {
      logger.debug('设置变量：', { key, value: webgalStore.getState().stage.GameVar[key] });
    }
  }
  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
