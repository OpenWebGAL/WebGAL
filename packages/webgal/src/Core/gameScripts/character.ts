import isEqual from 'lodash/isEqual';
import { v4 as uuid } from 'uuid';
import type { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, type IPerform } from '@/Core/Modules/perform/performInterface';
import type { ICharacterFigure } from '@/Core/Modules/stage/stageInterface';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { parseCharacterTarget } from '@/Core/character/characterTemplate';
import type { AnimationFrame } from '@/Core/Modules/animations';
import { applyAnimationEndState, getAnimateDuration, getExitDuration } from '@/Core/Modules/animationFunctions';
import type { IAnimationTrack } from '@/Core/Modules/animationTracks';
import { generateTransformAnimationObj } from '@/Core/controller/stage/pixi/animations/generateTransformAnimationObj';
import { generateTimelineObj } from '@/Core/controller/stage/pixi/animations/timeline';
import { WebGAL } from '@/Core/WebGAL';
import {
  getBooleanArgByKey,
  getFigurePositionFromArgs,
  getNumberArgByKey,
  getSentenceArgByKey,
  getStringArgByKey,
  resolveTransformArgs,
} from '@/Core/util/getSentenceArg';
import { logger } from '@/Core/util/logger';
import { DEFAULT_FIG_IN_DURATION, DEFAULT_FIG_OUT_DURATION, WEBGAL_NONE } from '@/Core/constants';
import { FIGURE_ASSOCIATED_ARGS } from './figureAssociatedAnimation';
import { parseTransformFrame } from './parseTransformFrame';

const UNSUPPORTED_FIGURE_ARGS = new Set<string>([
  'motion',
  'skin',
  'expression',
  'bounds',
  'blink',
  'focus',
  ...FIGURE_ASSOCIATED_ARGS,
]);

/** 组合立绘指令入口：直接读写 stageStateManager.characterFigures，独立于 changeFigure 槽位。 */
export function character(sentence: ISentence): IPerform {
  const content = sentence.content.trim();
  if (content === '' || content === WEBGAL_NONE) return clearCharacters();

  const target = parseCharacterTarget(content, getSentenceArgByKey(sentence, 'components'));
  if (!target) {
    logger.warn(`character 命令角色名无效，已忽略：${content}`);
    return createNonePerform();
  }
  if (getBooleanArgByKey(sentence, 'clear')) return clearCharacters(target.name);

  const ignored = sentence.args.filter((arg) => UNSUPPORTED_FIGURE_ARGS.has(arg.key)).map((arg) => `-${arg.key}`);
  if (ignored.length > 0) {
    logger.warn(`静态组合角色不支持参数，已忽略：${ignored.join(', ')}`);
  }

  return applyCharacter(sentence, target.name, target.preset, target.components);
}

function clearCharacters(characterName?: string, exceptKey?: string): IPerform {
  const targets = (stageStateManager.getCalculationStageState().characterFigures ?? []).filter(
    (entry) => entry.key !== exceptKey && (characterName === undefined || entry.name === characterName),
  );
  if (targets.length === 0) return createNonePerform();

  const duration = Math.max(...targets.map(clearCharacterEntry));
  return {
    performName: `exit-${targets[0].key}`,
    duration,
    isHoldOn: false,
    startFunction: () => {},
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
  };
}

function clearCharacterEntry(entry: ICharacterFigure): number {
  // 必须在移除 animationSettings 前计算退场时长，移除后阶段层会转为 ${key}-off 退场
  const exitDuration = getExitDuration(entry.key);

  WebGAL.gameplay.performController.unmountPerform(`animation-${entry.key}`, true);
  stageStateManager.removeEffectByTargetId(entry.key);
  stageStateManager.removeAnimationSettingsByTarget(entry.key);
  stageStateManager.setFigureMetaData([entry.key, 'zIndex', undefined, true]);
  stageStateManager.removeCharacterFigureByKey(entry.key);
  return exitDuration;
}

function applyCharacter(sentence: ISentence, name: string, preset?: string, components?: string[]): IPerform {
  const basePosition = getFigurePositionFromArgs(sentence) || 'center';
  const key = getStringArgByKey(sentence, 'id')?.trim() || `fig-${basePosition}`;

  // 同名角色不能同时留在多个槽位上
  clearCharacters(name, key);
  const existing = (stageStateManager.getCalculationStageState().characterFigures ?? []).find((e) => e.key === key);
  const isSameSlot = !!existing && existing.name === name && existing.basePosition === basePosition;

  // 同槽位互斥：清理普通立绘槽位后再写入组合立绘
  stageStateManager.clearStandardFigureSlotByKey(key);
  const next: ICharacterFigure = {
    key,
    name,
    basePosition,
    ...(preset !== undefined ? { preset } : {}),
    ...(components !== undefined ? { components } : {}),
  };

  const transformArgs = resolveCharacterTransformArgs(sentence);
  return isSameSlot
    ? updateCharacter(sentence, next, existing, transformArgs)
    : enterCharacter(sentence, next, transformArgs);
}

type CharacterTransformArgs = { writeDefault: boolean; writeFullEffect: boolean };

function enterCharacter(sentence: ISentence, next: ICharacterFigure, transformArgs: CharacterTransformArgs): IPerform {
  const { key } = next;
  const { writeDefault, writeFullEffect } = transformArgs;
  WebGAL.gameplay.performController.unmountPerform(`animation-${key}`, true);
  stageStateManager.removeEffectByTargetId(key);
  stageStateManager.removeAnimationSettingsByTarget(key);

  // 先写入 characterFigures，确保 applyAnimationEndState 能在 activeTargets 中找到该目标
  stageStateManager.setCharacterFigureByKey(next);
  stageStateManager.setFigureMetaData([key, 'zIndex', Math.max(getNumberArgByKey(sentence, 'zIndex') ?? 0, 0), false]);
  stageStateManager.setFigureMetaData([key, 'blendMode', getStringArgByKey(sentence, 'blendMode') ?? 'normal', false]);

  const enterAnim =
    resolveAnimName(sentence, 'enter') ?? createTransformAnimation(sentence, key, writeFullEffect, true)!;
  const enterDuration = resolveEnterDuration(sentence);
  stageStateManager.updateAnimationSettings({ target: key, key: 'enterAnimationName', value: enterAnim });
  stageStateManager.updateAnimationSettings({
    target: key,
    key: 'enterAnimationIgnoreDefault',
    value: !writeFullEffect,
  });
  if (enterDuration >= 0) {
    stageStateManager.updateAnimationSettings({ target: key, key: 'enterDuration', value: enterDuration });
  }
  applyExitAnimation(sentence, key, writeFullEffect, DEFAULT_FIG_OUT_DURATION);

  const timeline = applyAnimationEndState(enterAnim, key, writeDefault, writeFullEffect);
  return createAnimationPerform(key, getAnimateDuration(enterAnim), timeline);
}

function updateCharacter(
  sentence: ISentence,
  next: ICharacterFigure,
  existing: ICharacterFigure,
  transformArgs: CharacterTransformArgs,
): IPerform {
  const { key } = next;
  const { writeDefault, writeFullEffect } = transformArgs;
  // 同角色同槽位原地切换预设或部件，保留 effects 与正在运行的动画
  stageStateManager.setCharacterFigureByKey(next);

  const zIndex = getNumberArgByKey(sentence, 'zIndex');
  if (zIndex !== null && zIndex >= 0) stageStateManager.setFigureMetaData([key, 'zIndex', zIndex, false]);
  const blendMode = getStringArgByKey(sentence, 'blendMode');
  if (blendMode) stageStateManager.setFigureMetaData([key, 'blendMode', blendMode, false]);
  applyExitAnimation(sentence, key, writeFullEffect);

  const isSameSelection = existing.preset === next.preset && isEqual(existing.components, next.components);
  const animName = isSameSelection ? null : createTransformAnimation(sentence, key, writeFullEffect, false);
  if (!animName) return createNonePerform();

  WebGAL.gameplay.performController.unmountPerform(`animation-${key}`, true);
  const timeline = applyAnimationEndState(animName, key, writeDefault, writeFullEffect);
  return createAnimationPerform(key, getAnimateDuration(animName), timeline);
}

function resolveCharacterTransformArgs(sentence: ISentence): CharacterTransformArgs {
  const hasTransformFlag = ['transformFrom', 'writeDefault', 'ignoreDefault'].some(
    (key) => getSentenceArgByKey(sentence, key) !== null,
  );
  return hasTransformFlag ? resolveTransformArgs(sentence) : { writeDefault: false, writeFullEffect: true };
}

const resolveEnterDuration = (sentence: ISentence): number =>
  getNumberArgByKey(sentence, 'enterDuration') ?? getNumberArgByKey(sentence, 'duration') ?? DEFAULT_FIG_IN_DURATION;

function resolveAnimName(sentence: ISentence, argKey: 'enter' | 'exit'): string | null {
  const name = getStringArgByKey(sentence, argKey);
  if (!name) return null;
  if (WebGAL.animationManager.getAnimations().some((ani) => ani.name === name)) return name;
  logger.warn(`未找到角色 -${argKey} 动画：${name}，将使用默认淡入淡出`);
  return null;
}

function createTransformAnimation(
  sentence: ISentence,
  key: string,
  writeFullEffect: boolean,
  fadeIn: boolean,
): string | null {
  const rawTransform = getStringArgByKey(sentence, 'transform');
  const frame = rawTransform ? parseTransformFrame(rawTransform) : null;
  if (!fadeIn && !frame) return null;

  const duration = resolveEnterDuration(sentence);
  const ease = getStringArgByKey(sentence, 'ease') ?? '';
  const animationObj = generateTransformAnimationObj(
    key,
    frame ?? ({} as AnimationFrame),
    duration,
    ease,
    writeFullEffect,
  );
  if (fadeIn) animationObj[0].alpha = 0;

  const animName = uuid();
  WebGAL.animationManager.addAnimation(animName, animationObj);
  return animName;
}

function applyExitAnimation(
  sentence: ISentence,
  key: string,
  writeFullEffect: boolean,
  fallbackDuration?: number,
): void {
  const exitAnim = resolveAnimName(sentence, 'exit');
  if (exitAnim) {
    stageStateManager.updateAnimationSettings({ target: key, key: 'exitAnimationName', value: exitAnim });
    stageStateManager.updateAnimationSettings({
      target: key,
      key: 'exitAnimationIgnoreDefault',
      value: !writeFullEffect,
    });
  }
  const exitDuration = getNumberArgByKey(sentence, 'exitDuration') ?? fallbackDuration;
  if (exitDuration !== undefined && exitDuration >= 0) {
    stageStateManager.updateAnimationSettings({ target: key, key: 'exitDuration', value: exitDuration });
  }
}

function createAnimationPerform(key: string, duration: number, timeline: IAnimationTrack[] | null): IPerform {
  const enterKey = `${key}-softin`;
  return {
    performName: `animation-${key}`,
    duration,
    isHoldOn: false,
    startFunction: () => {
      if (!timeline || WebGAL.gameplay.skipAnimation) return;
      const animationObject = generateTimelineObj(timeline, key, duration);
      WebGAL.gameplay.pixiStage?.registerAnimation(animationObject, enterKey, key);
    },
    stopFunction: () => {
      WebGAL.gameplay.pixiStage?.removeAnimation(enterKey);
    },
    blockingNext: () => false,
    blockingAuto: () => true,
  };
}
