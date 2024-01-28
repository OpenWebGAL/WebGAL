import { commandType, ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';

/**
 * 规范函数的类型
 * @type {(sentence: ISentence) => IPerform}
 */
export type ScriptFunction = (sentence: ISentence) => IPerform;

export interface ScriptConfig {
  scriptType: commandType;
  scriptFunction: ScriptFunction;
  next?: boolean;
}

export interface IConfigInterface extends ScriptConfig {
  scriptString: string;
}

export function ScriptConfig(
  scriptType: commandType,
  scriptFunction: ScriptFunction,
  config?: Omit<ScriptConfig, 'scriptType' | 'scriptFunction'>,
): ScriptConfig {
  return { scriptType, scriptFunction, ...config };
}

export const scriptRegistry: Record<commandType, IConfigInterface> = {} as any;

export function defineScripts<R extends Record<string, Omit<IConfigInterface, 'scriptString'>>>(
  record: R,
): {
  [K in keyof R]: IConfigInterface;
} {
  // eslint-disable-next-line
  const result = {} as Record<keyof R, IConfigInterface>;
  for (const [scriptString, config] of Object.entries(record)) {
    result[scriptString as keyof R] = scriptRegistry[config.scriptType] = { scriptString, ...config };
  }
  return result;
}
