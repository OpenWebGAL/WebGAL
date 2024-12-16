import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { playVocal } from './vocal';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { useTextAnimationDuration, useTextDelay } from '@/hooks/useTextOptions';
import { getRandomPerformName, PerformController } from '@/Core/Modules/perform/performController';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { textSize, voiceOption } from '@/store/userDataInterface';
import { WebGAL } from '@/Core/WebGAL';
import { compileSentence } from '@/Stage/TextBox/TextBox';
import { performMouthAnimation } from '@/Core/gameScripts/vocal/vocalAnimation';
import { match } from '@/Core/util/match';

/**
 * 进行普通对话的显示
 * @param sentence 语句
 * @return {IPerform} 执行的演出
 */
export const say = (sentence: ISentence): IPerform => {
  const stageState = webgalStore.getState().stage;
  const userDataState = webgalStore.getState().userData;
  const dispatch = webgalStore.dispatch;
  let dialogKey = Math.random().toString(); // 生成一个随机的key
  let dialogToShow = sentence.content; // 获取对话内容
  if (dialogToShow) {
    dialogToShow = String(dialogToShow).replace(/ {2,}/g, (match) => '\u00a0'.repeat(match.length)); // 替换连续两个或更多空格
  }
  const isConcat = getSentenceArgByKey(sentence, 'concat'); // 是否是继承语句
  const isNotend = getSentenceArgByKey(sentence, 'notend') as boolean; // 是否有 notend 参数
  const speaker = getSentenceArgByKey(sentence, 'speaker'); // 获取说话者
  const clear = getSentenceArgByKey(sentence, 'clear'); // 是否清除说话者
  const vocal = getSentenceArgByKey(sentence, 'vocal'); // 是否播放语音

  // 如果是concat，那么就继承上一句的key，并且继承上一句对话。
  if (isConcat) {
    dialogKey = stageState.currentDialogKey;
    dialogToShow = stageState.showText + dialogToShow;
    dispatch(setStage({ key: 'currentConcatDialogPrev', value: stageState.showText }));
  } else {
    dispatch(setStage({ key: 'currentConcatDialogPrev', value: '' }));
  }

  // 设置文本显示
  dispatch(setStage({ key: 'showText', value: dialogToShow }));
  dispatch(setStage({ key: 'vocal', value: '' }));

  // 清除语音
  if (!(userDataState.optionData.voiceInterruption === voiceOption.no && vocal === null)) {
    // 只有开关设置为不中断，并且没有语音的时候，才需要不中断
    dispatch(setStage({ key: 'playVocal', value: '' }));
    WebGAL.gameplay.performController.unmountPerform('vocal-play', true);
  }
  // 设置key
  dispatch(setStage({ key: 'currentDialogKey', value: dialogKey }));
  // 计算延迟
  const textDelay = useTextDelay(userDataState.optionData.textSpeed);
  // 本句延迟
  const textNodes = compileSentence(sentence.content, 3);
  const len = textNodes.reduce((prev, curr) => prev + curr.length, 0);
  const sentenceDelay = textDelay * len;

  for (const e of sentence.args) {
    if (e.key === 'fontSize') {
      switch (e.value) {
        case 'default':
          dispatch(setStage({ key: 'showTextSize', value: -1 }));
          break;
        case 'small':
          dispatch(setStage({ key: 'showTextSize', value: textSize.small }));
          break;
        case 'medium':
          dispatch(setStage({ key: 'showTextSize', value: textSize.medium }));
          break;
        case 'large':
          dispatch(setStage({ key: 'showTextSize', value: textSize.large }));
          break;
      }
    }
  }

  // 设置显示的角色名称
  let showName: string | number | boolean = stageState.showName; // 先默认继承
  if (speaker !== null) {
    showName = speaker;
  }
  if (clear) {
    showName = '';
  }
  dispatch(setStage({ key: 'showName', value: showName }));

  // 模拟说话
  let performSimulateVocalTimeout: ReturnType<typeof setTimeout> | null = null;
  let performSimulateVocalDelay = 0;
  let pos = '';
  let key = '';
  for (const e of sentence.args) {
    if (e.value === true) {
      match(e.key)
        .with('left', () => {
          pos = 'left';
        })
        .with('right', () => {
          pos = 'right';
        })
        .endsWith('center', () => {
          pos = 'center';
        });
    }
    if (e.key === 'figureId') {
      key = `${e.value.toString()}`;
    }
  }
  let audioLevel = 80;
  const performSimulateVocal = (end = false) => {
    let nextAudioLevel = audioLevel + (Math.random() * 60 - 30); // 在 -30 到 +30 之间波动
    // 确保波动幅度不小于 5
    if (Math.abs(nextAudioLevel - audioLevel) < 5) {
      nextAudioLevel = audioLevel + Math.sign(nextAudioLevel - audioLevel) * 5;
    }
    // 确保结果在 25 到 100 之间
    audioLevel = Math.max(15, Math.min(nextAudioLevel, 100));
    const currentStageState = webgalStore.getState().stage;
    const figureAssociatedAnimation = currentStageState.figureAssociatedAnimation;
    const animationItem = figureAssociatedAnimation.find((tid) => tid.targetId === key);
    const targetKey = key ? key : `fig-${pos}`;
    if (end) {
      audioLevel = 0;
    }
    performMouthAnimation({
      audioLevel,
      OPEN_THRESHOLD: 50,
      HALF_OPEN_THRESHOLD: 25,
      currentMouthValue: 0,
      lerpSpeed: 1,
      key: targetKey,
      animationItem,
      pos,
    });
    if (!end) performSimulateVocalTimeout = setTimeout(performSimulateVocal, 50);
  };
  // 播放一段语音
  if (vocal) {
    playVocal(sentence);
  } else if (key || pos) {
    performSimulateVocalDelay = len * 250;
    performSimulateVocal();
  }

  const performInitName: string = getRandomPerformName();
  let endDelay = useTextAnimationDuration(userDataState.optionData.textSpeed) / 2;
  // 如果有 notend 参数，那么就不需要等待
  if (isNotend) {
    endDelay = 0;
  }

  return {
    performName: performInitName,
    duration: sentenceDelay + endDelay + performSimulateVocalDelay,
    isHoldOn: false,
    stopFunction: () => {
      WebGAL.events.textSettle.emit();
      if (performSimulateVocalTimeout) {
        performSimulateVocal(true);
        clearTimeout(performSimulateVocalTimeout);
      }
    },
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
    goNextWhenOver: isNotend,
  };
};
