import { webgalStore } from '@/store/store';
import { random } from 'lodash';
import { WebGAL } from '../WebGAL';
import expression from 'angular-expressions';
import { logger } from '@/Core/util/logger';

// 是否是函数调用
export const isFunctionCall = (valExp: string) => {
  return /^\s*[a-zA-Z_$][\w$]*\s*\(.*\)\s*$/.test(valExp);
};

export interface EvaluateExpressionOptions {
  /**
   * 当是无效值 `null | undefined | 报错` 时返回原值还是返回{...}包裹
   * @default block {...}包裹
   */
  InvalidValueReturns?: 'origin' | 'block';
  /**
   * 当是表达式报错时，是否返回布尔值
   */
  ErrorReturnsBoolean?: boolean;
}

/**
 * 执行运行时表达式
 */
export const EvaluateExpression = (val: string, options: EvaluateExpressionOptions = {}) => {
  const sceneUrl = WebGAL.sceneManager.sceneData.currentScene.sceneUrl;
  const sceneArguments = webgalStore.getState().stage.sceneArguments;
  const stage = webgalStore.getState().stage;
  const userData = webgalStore.getState().userData;
  const globalVars = userData.globalGameVar;
  const localVars = stage.GameVar;
  const _Merge = { $stage: stage, $userData: userData }; // 不要直接合并到一起，防止可能的键冲突
  try {
    const instance = expression.compile(val);
    const evalResult = instance({
      // 注入变量
      ...globalVars,
      ...localVars,
      ..._Merge,
      // 随机函数
      random(...args: any[]) {
        return args.length ? random(...args) : Math.random();
      },
      // 获取场景调用参数
      getArg(key: string) {
        const target = sceneArguments[sceneUrl];
        if (target) {
          return target.filter((item) => item.key === key)[0]?.value ?? null;
        }
        return null;
      },
    });

    if ((evalResult === null || evalResult === undefined) && options) {
      switch (options.InvalidValueReturns) {
        case 'block':
          return `{${val}}`;
        case 'origin':
          return val;
        default:
          return evalResult;
      }
    }

    return evalResult;
  } catch {
    logger.warn('EvaluateExpression throw error, expr = ' + val);
    if (options.ErrorReturnsBoolean) {
      return false;
    }
    switch (options.InvalidValueReturns) {
      case 'block':
        return `{${val}}`;
      case 'origin':
        return val;
      default:
        return `{${val}}`;
    }
  }
};
