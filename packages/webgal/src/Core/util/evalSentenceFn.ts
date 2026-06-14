import { webgalStore } from '@/store/store';
import random from 'lodash/random';
import { WebGAL } from '../WebGAL';
import expression from 'angular-expressions';
import { logger } from '@/Core/util/logger';
import { stageStateManager } from '../Modules/stage/stageStateManager';

// 是否是函数调用
export const isFunctionCall = (valExp: string) => {
  return /^\s*[a-zA-Z_$][\w$]*\s*\(.*\)\s*$/.test(valExp);
};

export const isObject = (valExp: string) => {
  try {
    return new Function(`return ${valExp}`)();
  } catch {
    return false;
  }
};

export interface EvaluateExpressionOptions {
  /**
   * 当是无效值 `null | undefined | Error` 时返回类型(函数调用时无效，将返回求值结果)
   * @default `result`
   * @description
   * `result` 返回求值结果(报错时无效)
   * `origin` 返回原expr值
   * `block` 返回 {...} 包裹原值
   * `boolean` 返回 false
   */
  returnType?: 'resullt' | 'origin' | 'block' | 'boolean';
}

/**
 * 在当前`Stage`运行时执行表达式
 *
 * 可执行：基础表达式，函数调用，变量调用，`{...}`包裹
 * @description
 * 当`expr`不为string时，将直接返回`expr`
 * @param val 表达式
 * @param options 配置
 */
export const evaluateStageExpression = (
  expr: string | number | boolean,
  options: EvaluateExpressionOptions = {
    returnType: 'resullt',
  },
) => {
  if (typeof expr === 'number' || typeof expr === 'boolean') return expr;
  let val = expr.trim();
  if (val.startsWith('{') && val.endsWith('}')) {
    if (!isObject(val)) {
      val = val.slice(1, -1);
    }
  }
  const sceneArguments = WebGAL.sceneManager.currentSceneParams;
  const stage = stageStateManager.getCalculationStageState();
  const userData = webgalStore.getState().userData;
  const globalVars = userData.globalGameVar;
  const localVars = stage.GameVar;
  const _Merge = { $stage: stage, $userData: userData }; // 不要直接合并到一起，防止可能的键冲突
  try {
    const instance = expression.compile(val);
    const evalResult = instance({
      /* 内置变量 */
      ...globalVars,
      ...localVars,
      ..._Merge,
      /* 内置函数 */
      random(...args: any[]) {
        return args.length ? random(...args) : Math.random();
      },
      // 获取场景调用参数
      getParentParams(key: string) {
        return sceneArguments[key];
      },
    });

    if (evalResult === null || evalResult === undefined) {
      if (isFunctionCall(val)) return evalResult;
      switch (options.returnType) {
        case 'origin':
          return val;
        case 'boolean':
          return false;
        case 'block':
          return `{${val}}`;
      }
    }
    return evalResult;
  } catch (e) {
    logger.warn('evaluateExpression throw error, expr = ' + val + ', error = ' + e);
    switch (options.returnType) {
      case 'origin':
        return val;
      case 'boolean':
        return false;
      case 'block':
        return `{${val}}`;
    }
  }
};

type ESEParameters = Parameters<typeof evaluateStageExpression>;

/**
 * 无引号字符串求值
 *
 * 用于`设置变量，参数处理`处理
 */
export const evaluateStageExpressionWithoutDot = (
  expr: ESEParameters[0],
  op: ESEParameters[1] = { returnType: 'block' },
) => {
  let val = expr;
  // 当expr没有标点符号，运算符时，将作为字符串处理
  if (typeof val === 'string' && !/[a-zA-Z_$][\w$]*\s*\(.*\)\s*$/.test(val) && !/[.,<>;"'{}():+\-*/%?![\]]/.test(val)) {
    val = `'${expr}'`;
  }
  return evaluateStageExpression(val, op);
};
