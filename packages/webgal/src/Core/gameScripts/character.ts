import { commandType, type ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, type IPerform } from '@/Core/Modules/perform/performInterface';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { CharacterTemplateError, parseCharacterSelector } from '@/Core/character/characterTemplate';
import {
  isCharacterFigureSource,
  listStageFigureTargets,
  parseCharacterFigureSource,
  resolveFigureSlotTarget,
  serializeCharacterFigureSource,
  type IFigureSlotTargetState,
} from '@/Core/character/characterSource';
import { getBooleanArgByKey, getSentenceArgByKey, resolveTransformArgs } from '@/Core/util/getSentenceArg';
import { logger } from '@/Core/util/logger';
import { WEBGAL_NONE } from '@/Core/constants';
import { changeFigure } from './changeFigure';
import { FIGURE_ASSOCIATED_ARGS } from './figureAssociatedAnimation';

const CHARACTER_UNSUPPORTED_FIGURE_ARGS = new Set<string>([
  'motion',
  'skin',
  'expression',
  'bounds',
  'blink',
  'focus',
  ...FIGURE_ASSOCIATED_ARGS,
]);

export function character(sentence: ISentence): IPerform {
  try {
    const content = sentence.content.trim();
    if (content === '' || content === WEBGAL_NONE) {
      return clearCharacterFigureTargets(sentence);
    }

    const selector = parseCharacterSelector(content);
    if (getBooleanArgByKey(sentence, 'clear')) {
      return clearCharacterFigureTargets(sentence, selector.characterName);
    }
    if (selector.items.length === 0) {
      throw new CharacterTemplateError(`角色 ${selector.characterName} 的组合列表不能为空`);
    }
    const unsupportedArg = sentence.args.find((arg) => CHARACTER_UNSUPPORTED_FIGURE_ARGS.has(arg.key));
    if (unsupportedArg) {
      throw new CharacterTemplateError(`静态组合角色不支持参数 -${unsupportedArg.key}`);
    }

    const target = resolveFigureSlotTarget(sentence);
    clearCharacterFigureTargets(sentence, selector.characterName, target.key);
    const source = serializeCharacterFigureSource({ name: selector.characterName, items: selector.items });
    return changeFigure(toStaticFigureSentence(sentence, source, buildForwardedArgs(sentence)));
  } catch (error) {
    const message = error instanceof CharacterTemplateError ? error.message : String(error);
    logger.error(`character 命令无效：${message}`);
    return createNonePerform();
  }
}

function clearCharacterFigureTargets(
  baseSentence: ISentence,
  characterName?: string,
  exceptTargetKey?: string,
): IPerform {
  const targets = listStageFigureTargets(stageStateManager.getCalculationStageState());
  const performs: IPerform[] = [];
  for (const target of targets) {
    if (!target.source || target.key === exceptTargetKey) {
      continue;
    }
    const shouldClear =
      characterName === undefined
        ? isCharacterFigureSource(target.source)
        : parseCharacterFigureSource(target.source)?.name === characterName;
    if (shouldClear) {
      performs.push(changeFigure(toClearFigureSentence(baseSentence, target)));
    }
  }
  return mergeClearedPerforms(performs);
}

function mergeClearedPerforms(performs: IPerform[]): IPerform {
  if (performs.length === 0) {
    return createNonePerform();
  }
  if (performs.length === 1) {
    return performs[0];
  }
  return {
    ...performs[0],
    duration: Math.max(...performs.map((perform) => perform.duration)),
    stopFunction: () => performs.forEach((perform) => perform.stopFunction()),
  };
}

function buildForwardedArgs(sentence: ISentence): ISentence['args'] {
  const hasTransformFrom = getSentenceArgByKey(sentence, 'transformFrom') !== null;
  const hasWriteDefault = getSentenceArgByKey(sentence, 'writeDefault') !== null;
  if (!hasTransformFrom && !hasWriteDefault) {
    return sentence.args;
  }
  const { writeFullEffect } = resolveTransformArgs(sentence);
  const filteredArgs = sentence.args.filter((arg) => arg.key !== 'ignoreDefault');
  return [...filteredArgs, { key: 'ignoreDefault', value: !writeFullEffect }];
}

function toStaticFigureSentence(sentence: ISentence, source: string, args: ISentence['args']): ISentence {
  return {
    ...sentence,
    command: commandType.changeFigure,
    commandRaw: 'changeFigure',
    content: source,
    args,
  };
}

function toClearFigureSentence(baseSentence: ISentence, target: IFigureSlotTargetState): ISentence {
  const args: ISentence['args'] = [{ key: target.position, value: true }];
  if (target.isFree) {
    args.push({ key: 'id', value: target.key });
  }
  return {
    ...baseSentence,
    command: commandType.changeFigure,
    commandRaw: 'changeFigure',
    content: WEBGAL_NONE,
    args,
    sentenceAssets: [],
    subScene: [],
    inlineComment: '',
    isLineBreakHolder: false,
  };
}
