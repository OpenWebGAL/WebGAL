import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { setStageVar } from '@/store/stageReducer';
import { logger } from '@/Core/util/logger';
import { compile } from 'angular-expressions';
import { setScriptManagedGlobalVar } from '@/store/userDataReducer';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { ISetGameVar } from '@/store/stageInterface';
import { dumpToStorageFast } from '@/Core/controller/storage/storageController';
import expression from 'angular-expressions';
import get from 'lodash/get';
import random from 'lodash/random';

/**
 * 设置变量
 * @param sentence
 */
export const setVar = (sentence: ISentence): IPerform => {
  let setGlobal = false;
  sentence.args.forEach((e) => {
    if (e.key === 'global') {
      setGlobal = true;
    }
  });
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
    if (/^\s*[a-zA-Z_$][\w$]*\s*\(.*\)\s*$/.test(valExp)) {
      webgalStore.dispatch(targetReducerFunction({ key, value: EvaluateExpression(valExp) }));
    } else if (valExp.match(/[+\-*\/()]/)) {
      // 如果包含加减乘除号，则运算
      // 先取出运算表达式中的变量
      const valExpArr = valExp.split(/([+\-*\/()])/g);
      // 将变量替换为变量的值，然后合成表达式字符串
      const valExp2 = valExpArr
        .map((e) => {
          if (!e.trim().match(/^[a-zA-Z_$][a-zA-Z0-9_.]*$/)) {
            // 检查是否是变量名，不是就返回本身
            return e;
          }
          const _r = getValueFromStateElseKey(e.trim(), true);
          return typeof _r === 'string' ? `'${_r}'` : _r;
        })
        .reduce((pre, curr) => pre + curr, '');
      let result = '';
      try {
        const exp = compile(valExp2);
        result = exp();
      } catch (e) {
        logger.error('expression compile error', e);
      }
      webgalStore.dispatch(targetReducerFunction({ key, value: result }));
    } else if (valExp.match(/true|false/)) {
      if (valExp.match(/true/)) {
        webgalStore.dispatch(targetReducerFunction({ key, value: true }));
      }
      if (valExp.match(/false/)) {
        webgalStore.dispatch(targetReducerFunction({ key, value: false }));
      }
    } else if (valExp.length === 0) {
      webgalStore.dispatch(targetReducerFunction({ key, value: '' }));
    } else {
      if (!isNaN(Number(valExp))) {
        webgalStore.dispatch(targetReducerFunction({ key, value: Number(valExp) }));
      } else {
        // 字符串
        webgalStore.dispatch(targetReducerFunction({ key, value: getValueFromStateElseKey(valExp, true) }));
      }
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

type BaseVal = string | number | boolean | undefined;

/**
 * 执行函数
 */
function EvaluateExpression(val: string) {
  const instance = expression.compile(val);
  return instance({
    random: (...args: any[]) => {
      return args.length ? random(...args) : Math.random();
    },
  });
}

/**
 * 取不到时返回 undefined
 */
export function getValueFromState(key: string) {
  let ret: any;
  const stage = webgalStore.getState().stage;
  const userData = webgalStore.getState().userData;
  const _Merge = { stage, userData }; // 不要直接合并到一起，防止可能的键冲突
  if (stage.GameVar.hasOwnProperty(key)) {
    ret = stage.GameVar[key];
  } else if (userData.globalGameVar.hasOwnProperty(key)) {
    ret = userData.globalGameVar[key];
  } else if (key.startsWith('$')) {
    const propertyKey = key.replace('$', '');
    ret = get(_Merge, propertyKey, undefined) as BaseVal;
  }
  return ret;
}

/**
 * 取不到时返回 {key}
 */
export function getValueFromStateElseKey(key: string, useKeyNameAsReturn = false) {
  const valueFromState = getValueFromState(key);
  if (valueFromState === null || valueFromState === undefined) {
    logger.warn('valueFromState result null, key = ' + key);
    if (useKeyNameAsReturn) {
      return key;
    }
    return `{${key}}`;
  }
  return valueFromState;
}
