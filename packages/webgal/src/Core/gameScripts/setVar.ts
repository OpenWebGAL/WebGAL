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

interface ISetGameVarFromExpressionPayload {
  key: string;
  value: string;
  isGlobal?: boolean;
  persistGlobal?: boolean;
}

/**
 * 设置变量表达式。
 */
export const setGameVarFromExpression = ({
  key,
  value,
  isGlobal = false,
  persistGlobal = true,
}: ISetGameVarFromExpressionPayload) => {
  const setGameVar = (payload: ISetGameVar) => {
    if (isGlobal) {
      webgalStore.dispatch(setScriptManagedGlobalVar(payload));
    } else {
      stageStateManager.setStageVar(payload);
    }
  };

  const normalizedKey = key.trim();
  if (!normalizedKey) {
    return;
  }
  setGameVar({ key: normalizedKey, value: resolveSetVarValue(value) });
  if (isGlobal) {
    logger.debug('设置全局变量：', { key: normalizedKey, value: webgalStore.getState().userData.globalGameVar[normalizedKey] });
    if (persistGlobal) {
      dumpToStorageFast();
    }
  } else {
    logger.debug('设置变量：', { key: normalizedKey, value: stageStateManager.getCalculationStageState().GameVar[normalizedKey] });
  }
};

/**
 * 设置变量
 * @param sentence
 */
export const setVar = (sentence: ISentence): IPerform => {
  const setGlobal = getBooleanArgByKey(sentence, 'global') ?? false;
  if (sentence.content.match(/\s*=\s*/)) {
    const key = sentence.content.split(/\s*=\s*/)[0];
    const valExp = sentence.content.split(/\s*=\s*/)[1];
    setGameVarFromExpression({ key, value: valExp, isGlobal: setGlobal });
  }
  return createNonePerform();
};

type BaseVal = string | number | boolean | undefined;

export function resolveSetVarValue(valExp: string): string | boolean | number {
  if (/^\s*[a-zA-Z_$][\w$]*\s*\(.*\)\s*$/.test(valExp)) {
    return EvaluateExpression(valExp);
  } else if (valExp.match(/[+\-*\/()]/)) {
    const valExpArr = valExp.split(/([+\-*\/()])/g);
    const valExp2 = valExpArr
      .map((e) => {
        if (!e.trim().match(/^[a-zA-Z_$][a-zA-Z0-9_.]*$/)) {
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
    return result;
  } else if (valExp.match(/true|false/)) {
    if (valExp.match(/true/)) {
      return true;
    }
    if (valExp.match(/false/)) {
      return false;
    }
  } else if (valExp.length === 0) {
    return '';
  } else {
    if (!isNaN(Number(valExp))) {
      return Number(valExp);
    } else {
      return getValueFromStateElseKey(valExp, true) ?? '';
    }
  }
  return '';
}

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
