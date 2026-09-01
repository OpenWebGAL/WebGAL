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
import { WebGAL } from '@/Core/WebGAL';
import { evaluateExpression, extractVariableNameAndExpression } from '@/Core/controller/gamePlay/expressionEvaluation';

/**
 * 变量的作用域，与查找链一一对应。
 * local 是当前调用帧的局部变量，与 callScene 传入的参数同处一个命名空间，帧结束即消失。
 */
export type VarScope = 'local' | 'stage' | 'global';

interface ISetGameVarFromExpressionPayload {
  key: string;
  value: string;
  scope?: VarScope;
  persistGlobal?: boolean;
}

/**
 * 写入游戏变量。setVar 与场景返回值共用这一条写入路径。
 */
export const setGameVar = (payload: ISetGameVar, scope: VarScope = 'stage') => {
  if (scope === 'global') {
    webgalStore.dispatch(setScriptManagedGlobalVar(payload));
  } else if (scope === 'local') {
    WebGAL.sceneManager.sceneData.currentLocals[payload.key] = payload.value;
  } else {
    stageStateManager.setStageVar(payload);
  }
};

/**
 * 从参数解析写入作用域。-global 与 -local 互斥，都写时以 -global 为准。
 */
const resolveVarScope = (sentence: ISentence): VarScope => {
  const isGlobal = getBooleanArgByKey(sentence, 'global') ?? false;
  const isLocal = getBooleanArgByKey(sentence, 'local') ?? false;
  if (isGlobal) {
    if (isLocal) {
      logger.warn('setVar 同时使用了 -global 和 -local，按 -global 处理', sentence.content);
    }
    return 'global';
  }
  return isLocal ? 'local' : 'stage';
};

/**
 * 设置变量表达式。
 */
export const setGameVarFromExpression = ({
  key,
  value,
  scope = 'stage',
  persistGlobal = true,
}: ISetGameVarFromExpressionPayload) => {
  const normalizedKey = key.trim();
  if (!normalizedKey) {
    return;
  }

  const resolvedValue = resolveSetVarValue(value);
  if (resolvedValue === undefined) {
    return;
  }
  setGameVar({ key: normalizedKey, value: resolvedValue }, scope);

  if (scope === 'global') {
    logger.debug('设置全局变量：', {
      key: normalizedKey,
      value: webgalStore.getState().userData.globalGameVar[normalizedKey],
    });
    if (persistGlobal) {
      dumpToStorageFast();
    }
  } else if (scope === 'local') {
    logger.debug('设置局部变量：', {
      key: normalizedKey,
      value: WebGAL.sceneManager.sceneData.currentLocals[normalizedKey],
    });
  } else {
    logger.debug('设置变量：', {
      key: normalizedKey,
      value: stageStateManager.getCalculationStageState().GameVar[normalizedKey],
    });
  }
};

/**
 * 设置变量
 * @param sentence
 */
export const setVar = (sentence: ISentence): IPerform => {
  const scope = resolveVarScope(sentence);
  if (WebGAL.legacyExpressionParser) {
    if (sentence.content.match(/\s*=\s*/)) {
      const key = sentence.content.split(/\s*=\s*/)[0];
      const valExp = sentence.content.split(/\s*=\s*/)[1];
      setGameVarFromExpression({ key, value: valExp, scope });
    }
  } else {
    const extracted = extractVariableNameAndExpression(sentence.content);
    if (extracted) {
      const { variableName, expression } = extracted;
      setGameVarFromExpression({ key: variableName, value: expression, scope });
    } else {
      logger.error(`setVar 语句格式错误，无法提取变量名和表达式: ${sentence.content}`);
    }
  }
  return createNonePerform();
};

type BaseVal = string | number | boolean | undefined;

const hasOwn = (obj: object, key: string) => Object.prototype.hasOwnProperty.call(obj, key);

export function resolveSetVarValue(valExp: string): string | boolean | number | undefined {
  if (!WebGAL.legacyExpressionParser) {
    // 空表达式（如不带返回值的 return）没有求值的必要，直接取空值，避免无谓的求值失败告警
    return valExp.trim() ? evaluateExpression(valExp) : '';
  }

  if (/^\s*[a-zA-Z_$][\w$]*\s*\(.*\)\s*$/.test(valExp)) {
    return LegacyEvaluateExpression(valExp);
  } else if (valExp.match(/[+\-*\/()]/)) {
    const valExpArr = valExp.split(/([+\-*\/()])/g);
    const valExp2 = valExpArr
      .map((e) => {
        if (!e.trim().match(/^[a-zA-Z_$][a-zA-Z0-9_.]*$/)) {
          return e;
        }
        const _r = legacyGetValueFromStateElseKey(e.trim(), true);
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
      return legacyGetValueFromStateElseKey(valExp, true) ?? '';
    }
  }
  return '';
}

/**
 * 执行函数
 */
function LegacyEvaluateExpression(val: string) {
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
export function legacyGetValueFromState(key: string) {
  let ret: any;
  const locals = WebGAL.sceneManager.sceneData.currentLocals;
  const stage = stageStateManager.getCalculationStageState();
  const userData = webgalStore.getState().userData;
  const _Merge = { stage, userData }; // 不要直接合并到一起，防止可能的键冲突
  // 查找链：当前帧局部变量 -> 舞台变量 -> 全局变量
  // 变量名由脚本作者决定，不能用实例上的 hasOwnProperty，否则 hasOwnProperty 这种名字会把方法本身覆盖掉
  if (hasOwn(locals, key)) {
    ret = locals[key];
  } else if (hasOwn(stage.GameVar, key)) {
    ret = stage.GameVar[key];
  } else if (hasOwn(userData.globalGameVar, key)) {
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
export function legacyGetValueFromStateElseKey(key: string, useKeyNameAsReturn = false, quoteString = false) {
  const valueFromState = legacyGetValueFromState(key);
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
