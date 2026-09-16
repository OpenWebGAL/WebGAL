import { commandType, type ISentence } from '@/Core/controller/scene/sceneInterface';
import { createNonePerform, type IPerform } from '@/Core/Modules/perform/performInterface';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { CharacterTemplateError, parseCharacterSelector } from '@/Core/character/characterTemplate';
import { parseCharacterFigureSource, serializeCharacterFigureSource } from '@/Core/character/characterFigureSource';
import {
  listFigureTargets,
  resolveFigureTarget,
  type IFigureTargetState,
} from '@/Core/character/characterFigureTarget';
import { getBooleanArgByKey } from '@/Core/util/getSentenceArg';
import { logger } from '@/Core/util/logger';
import { WEBGAL_NONE } from '@/Core/constants';
import { changeFigure } from './changeFigure';

const CHARACTER_UNSUPPORTED_FIGURE_ARGS = new Set([
  'motion',
  'skin',
  'expression',
  'bounds',
  'blink',
  'focus',
  'mouthOpen',
  'mouthClose',
  'mouthHalfOpen',
  'eyesOpen',
  'eyesClose',
  'animationFlag',
]);

export function character(sentence: ISentence): IPerform {
  try {
    const content = sentence.content.trim();
    // scriptExecutor normalizes the public `none` sentinel to an empty string before dispatch.
    if (content === '' || content === WEBGAL_NONE) {
      clearCharacterFigureTargets();
      return createNonePerform();
    }

    const selector = parseCharacterSelector(content);
    if (getBooleanArgByKey(sentence, 'clear')) {
      clearCharacterFigureTargets(selector.characterName);
      return createNonePerform();
    }
    if (selector.items.length === 0) {
      throw new CharacterTemplateError(`角色 ${selector.characterName} 的组合列表不能为空`);
    }
    const unsupportedArg = sentence.args.find((arg) => CHARACTER_UNSUPPORTED_FIGURE_ARGS.has(arg.key));
    if (unsupportedArg) {
      throw new CharacterTemplateError(`静态组合角色不支持参数 -${unsupportedArg.key}`);
    }

    const target = resolveFigureTarget(sentence);
    clearCharacterFigureTargets(selector.characterName, target.key);
    const source = serializeCharacterFigureSource({ name: selector.characterName, items: selector.items });
    // Character 只提供一个可持久化的静态图片来源；Figure 状态、transform、animation 与退场
    // 全部委托给上游 changeFigure。真正图片异步就绪后由 Character source adapter 交付给 Pixi。
    changeFigure(toStaticFigureSentence(sentence, source));
    return createNonePerform();
  } catch (error) {
    const message = error instanceof CharacterTemplateError ? error.message : String(error);
    logger.error(`character 命令无效：${message}`);
    return createNonePerform();
  }
}

function clearCharacterFigureTargets(characterName?: string, exceptTargetKey?: string): void {
  const targets = listFigureTargets(stageStateManager.getCalculationStageState());
  for (const target of targets) {
    if (!target.source || target.key === exceptTargetKey) {
      continue;
    }
    const source = parseCharacterFigureSource(target.source);
    if (source && (characterName === undefined || source.name === characterName)) {
      changeFigure(toClearFigureSentence(target));
    }
  }
}

function toStaticFigureSentence(sentence: ISentence, source: string): ISentence {
  return {
    ...sentence,
    command: commandType.changeFigure,
    commandRaw: 'changeFigure',
    content: source,
    args: sentence.args,
  };
}

function toClearFigureSentence(target: IFigureTargetState): ISentence {
  const args: ISentence['args'] = [{ key: target.position, value: true }];
  if (target.isFree) {
    args.push({ key: 'id', value: target.key });
  }
  return {
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
