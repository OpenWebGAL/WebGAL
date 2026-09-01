import expression from 'angular-expressions';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { webgalStore } from '@/store/store';
import { logger } from '@/Core/util/logger';
import random from 'lodash/random';
import { WebGAL } from '@/Core/WebGAL';

/**
 * 提取变量名和表达式
 * @param expressionString 表达式字符串，例如 "x = a + 5"
 * @returns 包含变量名和表达式，如果无效则返回 undefined
 */
export function extractVariableNameAndExpression(
  expressionString: string,
): { variableName: string; expression: string } | undefined {
  const equalIndex = expressionString.indexOf('=');
  if (equalIndex === -1) {
    return undefined;
  }

  const variableName = expressionString.substring(0, equalIndex).trim();
  if (variableName.length === 0) {
    return undefined;
  }

  const expression = expressionString.substring(equalIndex + 1).trim();
  if (expression.length === 0) {
    return undefined;
  }

  return { variableName, expression };
}

// 内置函数
const builtinFunctions = {
  random: (...args: any[]) => {
    return args.length ? random(...args) : Math.random();
  },
};

/**
 * 评估表达式字符串
 * @param expressionString 表达式字符串
 * @returns 评估结果，可能是 string、number、boolean 或 undefined
 * 但也有可能返回其他类型，取决于表达式的内容和上下文
 */
export function evaluateExpression(expressionString: string): string | number | boolean | undefined {
  try {
    const evaluate = expression.compile(expressionString);

    const stageState = stageStateManager.getCalculationStageState();
    const stageVar = stageState.GameVar;
    const userData = webgalStore.getState().userData;
    const globalVar = userData.globalGameVar;

    const scope: any = {};
    // 先加入内置函数（最低优先级）
    Object.assign(scope, builtinFunctions);
    // 然后按查找链依次覆盖：全局变量 -> 舞台变量 -> 当前调用帧的局部变量（最高优先级）
    Object.assign(scope, globalVar);
    Object.assign(scope, stageVar);
    Object.assign(scope, WebGAL.sceneManager.sceneData.currentLocals);
    // 支持 $ 前缀的特殊值
    scope['$stage'] = stageState;
    scope['$userData'] = userData;

    const result = evaluate(scope);
    switch (typeof result) {
      case 'string':
      case 'number':
      case 'boolean':
        return result;
      default:
        logger.warn(`不支持的表达式求值类型: ${typeof result}，表达式: ${expressionString}`);
        return undefined;
    }
  } catch (error) {
    logger.warn(`表达式求值失败: ${expressionString}`, error);
    return undefined;
  }
}
