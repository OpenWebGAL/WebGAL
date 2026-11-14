import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { FIGURE_POSITIONS, IFigurePosition } from '@/Core/Modules/stage/stageInterface';
import { toSafeBoolean, toSafeNumber, toSafeString } from './toSafeType';

export function getSentenceArgByKey(sentence: ISentence, argKey: string): null | string | boolean | number {
  const args = sentence.args;
  const result = args.find((arg) => arg.key === argKey);
  if (result) {
    return result.value;
  } else return null;
}

export function getBooleanArgByKey(sentence: ISentence, argKey: string): boolean | null {
  const argValue = getSentenceArgByKey(sentence, argKey);
  return toSafeBoolean(argValue);
}

export function getNumberArgByKey(sentence: ISentence, argKey: string): number | null {
  const argValue = getSentenceArgByKey(sentence, argKey);
  return toSafeNumber(argValue);
}

export function getStringArgByKey(sentence: ISentence, argKey: string): string | null {
  const argValue = getSentenceArgByKey(sentence, argKey);
  return toSafeString(argValue);
}

/**
 * 从参数中获取立绘的预设位置，没有指定位置时返回空字符串
 */
export function getFigurePositionFromArgs(sentence: ISentence): IFigurePosition | '' {
  return FIGURE_POSITIONS.find((position) => getBooleanArgByKey(sentence, position)) ?? '';
}

export type TransformFromMode = 'current' | 'default';

export interface ITransformConfig {
  writeDefault: boolean;
  writeFullEffect: boolean;
  transformFrom: TransformFromMode;
}

/**
 * 解析动画变换基准与写入模式
 * 1. 若有 transformFrom 则优先使用该参数，无论如何不考虑旧参数：
 *    - 'default': writeDefault = true, writeFullEffect = !parallel
 *    - 'current' (及其他非 default 值): writeDefault = false, writeFullEffect = false
 * 2. 若无 transformFrom，但显式传了旧参数 (-writeDefault 或 -ignoreDefault)，走旧参数逻辑：
 *    - writeDefault = getBooleanArgByKey(sentence, 'writeDefault') ?? false
 *    - writeFullEffect = !parallel && !(getBooleanArgByKey(sentence, 'ignoreDefault') ?? false)
 * 3. 若无 transformFrom 且未传旧参数，默认也是用 current (writeDefault = false, writeFullEffect = false)
 *
 * @param sentence 语句对象
 * @param parallel 是否并行动画 (parallel 模式下强制 writeFullEffect = false)
 */
export function resolveTransformArgs(sentence: ISentence, parallel = false): ITransformConfig {
  const transformFrom = getStringArgByKey(sentence, 'transformFrom');

  // 1. 如果有 transformFrom 就用这个参数，无论如何
  if (transformFrom !== null && transformFrom !== '') {
    if (transformFrom === 'default') {
      return {
        transformFrom: 'default',
        writeDefault: true,
        writeFullEffect: !parallel,
      };
    }
    return {
      transformFrom: 'current',
      writeDefault: false,
      writeFullEffect: false,
    };
  }

  // 2. 如果没有 transformFrom，并且非要传旧参数，那才完全不考虑 transformFrom
  const hasOldWriteDefault = getSentenceArgByKey(sentence, 'writeDefault') !== null;
  const hasOldIgnoreDefault = getSentenceArgByKey(sentence, 'ignoreDefault') !== null;
  if (hasOldWriteDefault || hasOldIgnoreDefault) {
    const writeDefault = getBooleanArgByKey(sentence, 'writeDefault') ?? false;
    const writeFullEffect = !parallel && !(getBooleanArgByKey(sentence, 'ignoreDefault') ?? false);
    return {
      transformFrom: writeDefault ? 'default' : 'current',
      writeDefault,
      writeFullEffect,
    };
  }

  // 3. 如果没有 transformFrom，也是用 current
  return {
    transformFrom: 'current',
    writeDefault: false,
    writeFullEffect: false,
  };
}
