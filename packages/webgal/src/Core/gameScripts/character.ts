import isEqual from 'lodash/isEqual';
import { v4 as uuid } from 'uuid';
import type { ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, type IPerform } from '@/Core/Modules/perform/performInterface';
import type { ICharacterFigure } from '@/Core/Modules/stage/stageInterface';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { CharacterTemplateError, parseCharacterSelector } from '@/Core/character/characterTemplate';
import type { AnimationFrame } from '@/Core/Modules/animations';
import { applyAnimationEndState, getAnimateDuration } from '@/Core/Modules/animationFunctions';
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

const CHARACTER_UNSUPPORTED_FIGURE_ARGS = new Set<string>([
  'motion',
  'skin',
  'expression',
  'bounds',
  'blink',
  'focus',
  ...FIGURE_ASSOCIATED_ARGS,
]);

interface ICharacterAnimationArgs {
  transformString: string | null;
  ease: string;
  enterDuration: number;
  exitDurationArg: number | null;
  exitDuration: number;
  enterAnimation: string | null;
  exitAnimation: string | null;
  zIndex: number;
  blendMode: string | null;
  ignoreDefault: boolean;
}

/**
 * 组合立绘指令入口：直接读写 stageStateManager.characterFigures，独立于 changeFigure 槽位。
 */
export function character(sentence: ISentence): IPerform {
  try {
    const content = sentence.content.trim();
    if (content === '' || content === WEBGAL_NONE) {
      return clearCharacterFigures();
    }

    const selector = parseCharacterSelector(content);
    if (getBooleanArgByKey(sentence, 'clear')) {
      return clearCharacterFigures(selector.characterName);
    }
    if (selector.items.length === 0) {
      throw new CharacterTemplateError(`角色 ${selector.characterName} 的组合列表不能为空`);
    }
    const unsupportedArg = sentence.args.find((arg) => CHARACTER_UNSUPPORTED_FIGURE_ARGS.has(arg.key));
    if (unsupportedArg) {
      throw new CharacterTemplateError(`静态组合角色不支持参数 -${unsupportedArg.key}`);
    }

    return applyCharacterFigure(sentence, selector.characterName, selector.items);
  } catch (error) {
    const message = error instanceof CharacterTemplateError ? error.message : String(error);
    logger.error(`character 命令无效：${message}`);
    return createNonePerform();
  }
}

function clearCharacterFigures(characterName?: string, exceptTargetKey?: string): IPerform {
  const state = stageStateManager.getCalculationStageState();
  const targets = (state.characterFigures ?? []).filter((entry) => {
    if (entry.key === exceptTargetKey) {
      return false;
    }
    return characterName === undefined || entry.name === characterName;
  });
  if (targets.length === 0) {
    return createNonePerform();
  }

  const durations = targets.map((entry) => clearCharacterEntry(entry));
  return {
    performName: `exit-${targets[0].key}`,
    duration: Math.max(...durations),
    isHoldOn: false,
    startFunction: () => {},
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
  };
}

function clearCharacterEntry(entry: ICharacterFigure): number {
  const state = stageStateManager.getCalculationStageState();
  const setting = state.animationSettings.find((item) => item.target === entry.key);
  // 必须先计算退场时长，再移除 animationSettings（后者会转为 ${key}-off 供视图层播放）
  const exitDuration = setting?.exitAnimationName
    ? getAnimateDuration(setting.exitAnimationName)
    : setting?.exitDuration ?? DEFAULT_FIG_OUT_DURATION;

  WebGAL.gameplay.performController.unmountPerform(`animation-${entry.key}`, true);
  stageStateManager.removeEffectByTargetId(entry.key);
  stageStateManager.removeAnimationSettingsByTarget(entry.key);
  stageStateManager.setFigureMetaData([entry.key, 'zIndex', undefined, true]);
  stageStateManager.removeCharacterFigureByKey(entry.key);
  return exitDuration;
}

function applyCharacterFigure(sentence: ISentence, characterName: string, items: string[]): IPerform {
  const pos = getFigurePositionFromArgs(sentence) || 'center';
  const explicitId = getStringArgByKey(sentence, 'id')?.trim() ?? '';
  const key = explicitId || `fig-${pos}`;

  // 同名角色不能同时留在多个槽位上
  clearCharacterFigures(characterName, key);

  const state = stageStateManager.getCalculationStageState();
  const existing = (state.characterFigures ?? []).find((entry) => entry.key === key);
  const isSameCharacterSlot = !!existing && existing.name === characterName && existing.basePosition === pos;
  const isSameItems = isSameCharacterSlot && isEqual(existing.items, items);

  // 同槽位互斥：清理普通立绘槽位，再写入组合立绘
  stageStateManager.clearStandardFigureSlotByKey(key);

  const args = resolveCharacterAnimationArgs(sentence);
  const nextCharacter: ICharacterFigure = {
    key,
    name: characterName,
    items,
    basePosition: pos,
  };

  if (!isSameCharacterSlot) {
    return enterCharacterFigure(nextCharacter, args);
  }
  return updateCharacterFigure(nextCharacter, isSameItems, args);
}

function resolveCharacterAnimationArgs(sentence: ISentence): ICharacterAnimationArgs {
  const duration = getNumberArgByKey(sentence, 'duration') ?? DEFAULT_FIG_IN_DURATION;
  const exitDurationArg = getNumberArgByKey(sentence, 'exitDuration');
  const hasTransformFrom = getSentenceArgByKey(sentence, 'transformFrom') !== null;
  const hasWriteDefault = getSentenceArgByKey(sentence, 'writeDefault') !== null;
  const ignoreDefault =
    hasTransformFrom || hasWriteDefault
      ? !resolveTransformArgs(sentence).writeFullEffect
      : getBooleanArgByKey(sentence, 'ignoreDefault') ?? false;

  return {
    transformString: getStringArgByKey(sentence, 'transform'),
    ease: getStringArgByKey(sentence, 'ease') ?? '',
    enterDuration: getNumberArgByKey(sentence, 'enterDuration') ?? duration,
    exitDurationArg,
    exitDuration: exitDurationArg ?? DEFAULT_FIG_OUT_DURATION,
    enterAnimation: getStringArgByKey(sentence, 'enter'),
    exitAnimation: getStringArgByKey(sentence, 'exit'),
    zIndex: getNumberArgByKey(sentence, 'zIndex') ?? -1,
    blendMode: getStringArgByKey(sentence, 'blendMode'),
    ignoreDefault,
  };
}

function enterCharacterFigure(nextCharacter: ICharacterFigure, args: ICharacterAnimationArgs): IPerform {
  const { key } = nextCharacter;
  WebGAL.gameplay.performController.unmountPerform(`animation-${key}`, true);
  stageStateManager.removeEffectByTargetId(key);
  stageStateManager.removeAnimationSettingsByTarget(key);

  // 先写入 characterFigures，确保 applyAnimationEndState 能在 activeTargets 中找到该目标
  stageStateManager.setCharacterFigureByKey(nextCharacter);
  stageStateManager.setFigureMetaData([key, 'zIndex', Math.max(args.zIndex, 0), false]);
  stageStateManager.setFigureMetaData([key, 'blendMode', args.blendMode ?? 'normal', false]);

  const resolvedEnterAnimName = registerEnterAnimation(key, args);
  registerExitAnimationSettings(key, args);
  if (args.enterDuration >= 0) {
    stageStateManager.updateAnimationSettings({ target: key, key: 'enterDuration', value: args.enterDuration });
  }
  if (args.exitDuration >= 0) {
    stageStateManager.updateAnimationSettings({ target: key, key: 'exitDuration', value: args.exitDuration });
  }

  const resolvedEnterDuration = getAnimateDuration(resolvedEnterAnimName);
  const enterAnimationTimeline = applyAnimationEndState(resolvedEnterAnimName, key, false, !args.ignoreDefault);
  return buildAnimationPerform(key, resolvedEnterDuration, enterAnimationTimeline);
}

function updateCharacterFigure(
  nextCharacter: ICharacterFigure,
  isSameItems: boolean,
  args: ICharacterAnimationArgs,
): IPerform {
  const { key } = nextCharacter;
  // 同角色同槽位原地切换 items，保留 effects 与正在运行的动画
  stageStateManager.setCharacterFigureByKey(nextCharacter);

  if (args.zIndex >= 0) {
    stageStateManager.setFigureMetaData([key, 'zIndex', args.zIndex, false]);
  }
  if (args.blendMode) {
    stageStateManager.setFigureMetaData([key, 'blendMode', args.blendMode, false]);
  }
  registerExitAnimationSettings(key, args);
  if (args.exitDurationArg !== null && args.exitDurationArg >= 0) {
    stageStateManager.updateAnimationSettings({ target: key, key: 'exitDuration', value: args.exitDurationArg });
  }

  if (!isSameItems && args.transformString) {
    const frame = parseTransformFrame(args.transformString);
    if (frame) {
      const animationObj = generateTransformAnimationObj(
        key,
        frame,
        args.enterDuration,
        args.ease,
        !args.ignoreDefault,
      );
      const animName = uuid();
      WebGAL.animationManager.addAnimation(animName, animationObj);
      const resolvedDuration = getAnimateDuration(animName);
      const timeline = applyAnimationEndState(animName, key, false, !args.ignoreDefault);
      return buildAnimationPerform(key, resolvedDuration, timeline);
    }
  }

  return createNonePerform();
}

function registerEnterAnimation(key: string, args: ICharacterAnimationArgs): string {
  let animationName = args.enterAnimation;
  if (!animationName) {
    const frame = args.transformString ? parseTransformFrame(args.transformString) : null;
    const animationObj = generateTransformAnimationObj(
      key,
      frame ?? ({} as AnimationFrame),
      args.enterDuration,
      args.ease,
      !args.ignoreDefault,
    );
    animationObj[0].alpha = 0;
    animationName = uuid();
    WebGAL.animationManager.addAnimation(animationName, animationObj);
  }
  stageStateManager.updateAnimationSettings({ target: key, key: 'enterAnimationName', value: animationName });
  stageStateManager.updateAnimationSettings({
    target: key,
    key: 'enterAnimationIgnoreDefault',
    value: args.ignoreDefault,
  });
  return animationName;
}

function registerExitAnimationSettings(key: string, args: ICharacterAnimationArgs) {
  if (!args.exitAnimation) {
    return;
  }
  stageStateManager.updateAnimationSettings({ target: key, key: 'exitAnimationName', value: args.exitAnimation });
  stageStateManager.updateAnimationSettings({
    target: key,
    key: 'exitAnimationIgnoreDefault',
    value: args.ignoreDefault,
  });
}

function buildAnimationPerform(key: string, duration: number, timeline: IAnimationTrack[] | null): IPerform {
  const enterAnimationKey = `${key}-softin`;
  return {
    performName: `animation-${key}`,
    duration,
    isHoldOn: false,
    startFunction: () => {
      if (!timeline || WebGAL.gameplay.skipAnimation) {
        return;
      }
      const animationObject = generateTimelineObj(timeline, key, duration);
      WebGAL.gameplay.pixiStage?.registerAnimation(animationObject, enterAnimationKey, key);
    },
    stopFunction: () => {
      WebGAL.gameplay.pixiStage?.removeAnimation(enterAnimationKey);
    },
    blockingNext: () => false,
    blockingAuto: () => true,
  };
}
