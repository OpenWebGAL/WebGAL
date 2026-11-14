import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { getBooleanArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { textSize, voiceOption } from '@/store/userDataInterface';
import { WebGAL } from '@/Core/WebGAL';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { getDialogSegments } from '@/Core/Modules/stage/dialogText';
import { createSayPerform } from './say/createSayPerform';

/**
 * 进行普通对话的显示
 * @param sentence 语句
 * @return {IPerform} 执行的演出
 */
export const say = (sentence: ISentence): IPerform => {
  const stageState = stageStateManager.getCalculationStageState();
  const userDataState = webgalStore.getState().userData;
  let dialogKey = Math.random().toString(); // 生成一个随机的key
  let dialogToShow = sentence.content; // 获取对话内容
  if (dialogToShow) {
    dialogToShow = String(dialogToShow).replace(/ {2,}/g, (match) => '\u00a0'.repeat(match.length)); // 替换连续两个或更多空格
  }
  const isConcat = getBooleanArgByKey(sentence, 'concat') ?? false; // 是否是继承语句
  const isNotend = getBooleanArgByKey(sentence, 'notend') ?? false; // 是否有 notend 参数
  const speaker = getStringArgByKey(sentence, 'speaker'); // 获取说话者
  const clear = getBooleanArgByKey(sentence, 'clear') ?? false; // 是否清除说话者
  const vocal = getStringArgByKey(sentence, 'vocal'); // 是否播放语音
  const dialogSegments = isConcat ? [...getDialogSegments(stageState), dialogToShow] : [dialogToShow];

  // 如果是concat，那么就继承上一句的key，并且继承上一句对话。
  if (isConcat) {
    dialogKey = stageState.currentDialogKey;
    dialogToShow = stageState.showText + dialogToShow;
    stageStateManager.setStage('currentConcatDialogPrev', stageState.showText);
  } else {
    stageStateManager.setStage('currentConcatDialogPrev', '');
  }

  // 设置文本显示
  stageStateManager.setStage('showText', dialogToShow);
  stageStateManager.setStage('currentDialogSegments', dialogSegments);
  stageStateManager.setStage('isDialogNotend', isNotend);
  WebGAL.flowchartManager.requestUnlockCurrentScene();
  stageStateManager.setStage('vocal', '');

  // 清除语音
  if (!(userDataState.optionData.voiceInterruption === voiceOption.no && vocal === null)) {
    // 只有开关设置为不中断，并且没有语音的时候，才需要不中断
    stageStateManager.setStage('playVocal', '');
    WebGAL.gameplay.performController.unmountPerform('vocal-play', true);
  }
  // 设置key
  stageStateManager.setStage('currentDialogKey', dialogKey);

  const fontSizeFromArgs = getStringArgByKey(sentence, 'fontSize');
  switch (fontSizeFromArgs) {
    case 'small':
      stageStateManager.setStage('showTextSize', textSize.small);
      break;
    case 'medium':
      stageStateManager.setStage('showTextSize', textSize.medium);
      break;
    case 'large':
      stageStateManager.setStage('showTextSize', textSize.large);
      break;
    default:
      stageStateManager.setStage('showTextSize', -1);
      break;
  }

  // 设置显示的角色名称
  let showName = stageState.showName; // 先默认继承
  if (speaker !== null) {
    showName = speaker;
  }
  if (clear) {
    showName = '';
  }
  stageStateManager.setStage('showName', showName);

  return createSayPerform(sentence);
};
