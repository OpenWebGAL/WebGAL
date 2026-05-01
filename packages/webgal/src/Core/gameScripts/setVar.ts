import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { logger } from '@/Core/util/logger';
import { compile } from 'angular-expressions';
import { setScriptManagedGlobalVar } from '@/store/userDataReducer';
import { ISetGameVar } from '@/Core/Modules/stage/stageInterface';
import { dumpToStorageFast } from '@/Core/controller/storage/storageController';
import expression from 'angular-expressions';
import get from 'lodash/get';
import random from 'lodash/random';
import { getBooleanArgByKey } from '../util/getSentenceArg';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';

/**
 * 设置变量
 * @param sentence
 */
export const setVar = (sentence: ISentence): IPerform => {
  let setGlobal = getBooleanArgByKey(sentence, 'global') ?? false;
  const setGameVar = (payload: ISetGameVar) => {
    if (setGlobal) {
      webgalStore.dispatch(setScriptManagedGlobalVar(payload));
    } else {
      stageStateManager.setStageVar(payload);
    }
  };
  // 先把表达式拆分为变量名和赋值语句
  if (sentence.content.match(/\s*=\s*/)) {
    const key = sentence.content.split(/\s*=\s*/)[0];
    const valExp = sentence.content.split(/\s*=\s*/)[1];
    if (/^\s*[a-zA-Z_$][\w$]*\s*\(.*\)\s*$/.test(valExp)) {
      setGameVar({ key, value: EvaluateExpression(valExp) });
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
      setGameVar({ key, value: result });
    } else if (valExp.match(/true|false/)) {
      if (valExp.match(/true/)) {
        setGameVar({ key, value: true });
      }
      if (valExp.match(/false/)) {
        setGameVar({ key, value: false });
      }
    } else if (valExp.length === 0) {
      setGameVar({ key, value: '' });
    } else {
      if (!isNaN(Number(valExp))) {
        setGameVar({ key, value: Number(valExp) });
      } else {
        // 字符串
        setGameVar({ key, value: getValueFromStateElseKey(valExp, true) });
      }
    }
    if (setGlobal) {
      logger.debug('设置全局变量：', { key, value: webgalStore.getState().userData.globalGameVar[key] });
      dumpToStorageFast();
    } else {
      logger.debug('设置变量：', { key, value: stageStateManager.getCalculationStageState().GameVar[key] });
    }
  }
  return createNonePerform();
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
  const stage = stageStateManager.getCalculationStageState();
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
export function getValueFromStateElseKey(key: string, useKeyNameAsReturn = false, quoteString = false) {
  const valueFromState = getValueFromState(key);
  if (valueFromState === null || valueFromState === undefined) {
    logger.warn('valueFromState result null, key = ' + key);
    if (useKeyNameAsReturn) {
      return key;
    }
    return `{${key}}`;
  }
  // 用 "" 包裹字符串，用于使用 compile 条件判断，处理字符串类型的变量
  if (quoteString && typeof valueFromState === 'string') {
    return `"${valueFromState.replaceAll('"', '\\"')}"`;
  }
  return valueFromState;
}
