import type { Container } from 'pixi.js';
import { logger } from '../logger';

/**
 * 特效执行返回的结果
 */
export type IResult<R extends Omit<Record<string | symbol | number, unknown>, 'container' | 'tickerKey'> = {}> = {
  container: Container;
  tickerKey: string;
} & R;

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
export function registerPerform(name: IName, callback: IPerformCallback): void {
  if (!callback || typeof callback !== 'function') throw new Error(`"${name}" is not a callback.`);
  performs.set(getKey(name), callback);
}

/**
 * 调用特效
 * @param name 特效名
 * @param args 自定义的参数
 * @returns {IResult}
 */
export function call(name: IName, args: unknown[] = []): IResult {
  const callback = performs.get(getKey(name));

  if (!callback || !(callback instanceof Function)) {
    logger.error(`Can\'t call the perform named "${name}"`);
    throw new Error(`"${name}" don't have the pixiPerform callback.`);
  }
  return (callback as IPerformCallback)(...(args as []));
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
