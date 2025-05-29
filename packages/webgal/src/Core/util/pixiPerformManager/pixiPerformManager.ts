import type { Container } from 'pixi.js';
import { logger } from '../logger';

export interface ILayerResult {
  container: Container;
  tickerKey: string;
}

export type ILayerGenerator = () => ILayerResult;

/**
 * 特效执行返回的结果
 */
export interface IResult {
  fg?: ILayerResult;
  bg?: ILayerResult;
}

/**
 * 特效定义对象
 */
export interface IPerformDefinition {
  fg?: ILayerGenerator;
  bg?: ILayerGenerator;
}

type IName = string | (() => string);

type IPerformCallback = () => IResult;

const performs = new Map<string, IPerformCallback>();

/**
 * 获取名称, 可能报空
 * @param name 名称或者返回名称的函数
 * @returns {string}
 */
function getName(name: IName): string | null {
  if (!name) return null;
  if (typeof name === 'string') return name;
  return name();
}

/**
 * 获取名称, 不会报空
 * @param name 名称或者返回名称的函数
 * @returns {string}
 */
function getKey(name: IName): string {
  const key = getName(name);
  if (!key) {
    logger.error('Get name of perform failed. There no name of the perform.');
    return '';
  }
  return key;
}

/**
 * 注册特效, 注意, 同名会注销旧特效
 * @param name 特效名
 * @param callback 调用特效的函数
 */
export function registerPerform(name: IName, definition: IPerformDefinition): void {
  const effectKey = getKey(name);
  if (!effectKey) {
    throw new Error('Cannot register a perform without a valid name.');
  }

  const { fg: fgGenerator, bg: bgGenerator } = definition;

  if (typeof fgGenerator !== 'undefined' && typeof fgGenerator !== 'function') {
    throw new Error(`"fg" property for perform "${effectKey}" must be a function or undefined.`);
  }
  if (typeof bgGenerator !== 'undefined' && typeof bgGenerator !== 'function') {
    throw new Error(`"bg" property for perform "${effectKey}" must be a function or undefined.`);
  }

  if (!fgGenerator && !bgGenerator) {
    throw new Error(`Perform definition for "${effectKey}" must have at least an 'fg' or 'bg' generator function.`);
  }

  const internalCallback: IPerformCallback = (): IResult => {
    let fgResult: ILayerResult | undefined;
    let bgResult: ILayerResult | undefined;

    if (fgGenerator) {
      fgResult = fgGenerator();
      if (!fgResult || typeof fgResult.container === 'undefined' || typeof fgResult.tickerKey === 'undefined') {
        logger.error(`The 'fg' generator for perform "${effectKey}" did not return a valid ILayerResult.`);
        throw new Error(`Invalid result from 'fg' generator for perform "${effectKey}".`);
      }
    }

    if (bgGenerator) {
      bgResult = bgGenerator();
      if (!bgResult || typeof bgResult.container === 'undefined' || typeof bgResult.tickerKey === 'undefined') {
        logger.error(`The 'bg' generator for perform "${effectKey}" did not return a valid ILayerResult.`);
        throw new Error(`Invalid result from 'bg' generator for perform "${effectKey}".`);
      }
    }

    const resultPayload: IResult = {};
    if (fgResult) {
      resultPayload.fg = fgResult;
    }
    if (bgResult) {
      resultPayload.bg = bgResult;
    }

    return resultPayload;
  };

  performs.set(effectKey, internalCallback);
}

/**
 * 调用特效
 * @param name 特效名
 * @returns {IResult}
 */
export function call(name: IName): IResult {
  const callback = performs.get(getKey(name));

  if (!callback || typeof callback !== 'function') {
    const nameStr = typeof name === 'function' ? getKey(name) : name;
    const errorMsg = `Can't call the perform named "${nameStr}". It might not be registered or was unregistered.`;
    logger.error(errorMsg);
    throw new Error(
      `Perform "${nameStr}" does not have a valid callback. Available performs: ${getPerforms().join(', ')}`,
    );
  }
  return callback();
}

/**
 * 注销特效
 * @param name 特效名
 */
export function unregisterPerform(name: IName) {
  performs.delete(getKey(name));
}

/**
 * 获取全部可调用的特效特效名
 */
export function getPerforms(): string[] {
  return [...performs.keys()];
}

import('./initRegister');
