import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { getRandomPerformName } from '@/Core/Modules/perform/performController';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { getDialogSegments } from '@/Core/Modules/stage/dialogText';
import { getBooleanArgByKey, getFigurePositionFromArgs, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { WebGAL } from '@/Core/WebGAL';
import { webgalStore } from '@/store/store';
import { getTextLineLimit, useTextAnimationDuration, useTextDelay } from '@/hooks/useTextOptions';
import { compileSentence } from '@/Stage/TextBox/TextBox';
import { concatTextLines } from '@/Stage/TextBox/concatTextLines';
import { playVocal } from '../vocal';
import { createSimulatedVocal } from './createSimulatedVocal';

/** 对话状态已由命令或存档确定，在创建演出时一次算好时长，不再改写正文。 */
export function createSayPerform(sentence: ISentence): IPerform {
  const state = stageStateManager.getCalculationStageState();
  const userData = webgalStore.getState().userData;
  const isNotend = getBooleanArgByKey(sentence, 'notend') ?? false;
  const vocal = getStringArgByKey(sentence, 'vocal');
  const pos = getFigurePositionFromArgs(sentence);
  const key = getStringArgByKey(sentence, 'figureId') ?? '';
  const textDelay = useTextDelay(userData.optionData.textSpeed);
  const len = compileSentence(sentence.content, 3).flat().length;
  let sentenceDelay = len * textDelay;
  if (isNotend) {
    // 与文本框使用相同的分段和行数限制，只为实际新增的可见节点计时。
    const size = state.showTextSize === -1 ? userData.optionData.textSize : state.showTextSize;
    const lineLimit = getTextLineLimit(size, userData.globalGameVar.Max_line);
    const { textArray, concatPrefixNodeCount } = concatTextLines(
      getDialogSegments(state).map((text) => compileSentence(text, lineLimit, true)),
      lineLimit,
    );
    sentenceDelay = (textArray.flat().length - concatPrefixNodeCount) * textDelay;
  }

  if (vocal) WebGAL.gameplay.performController.arrangeNewPerform(playVocal(sentence), sentence, false);
  const shouldSimulateVocal = !vocal && (key !== '' || pos !== '');
  const simulatedVocal = shouldSimulateVocal ? createSimulatedVocal(pos, key) : undefined;
  // notend 仍播放模拟嘴型，但不为它延长文字演出；文字结束时一同停止。
  const performSimulateVocalDelay = !isNotend && shouldSimulateVocal ? len * 250 : 0;
  const endDelay = isNotend ? 0 : useTextAnimationDuration(userData.optionData.textSpeed);

  return {
    performName: getRandomPerformName(),
    duration: sentenceDelay + endDelay + performSimulateVocalDelay,
    isHoldOn: false,
    startFunction: () => simulatedVocal?.start(),
    stopFunction: () => {
      WebGAL.events.textSettle.emit();
      simulatedVocal?.stop();
    },
    blockingNext: () => false,
    blockingAuto: () => true,
    goNextWhenOver: isNotend,
  };
}
