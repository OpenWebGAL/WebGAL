import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import styles1 from '../../Components/Stage/TextBox/textbox.module.scss';
import styles2 from '../../Components/Stage/TextBox/textboxFilm.module.scss';
import { playVocal } from './playVocal';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { useTextDelay } from '@/hooks/useTextOptions';
import { getRandomPerformName, PerformController } from '@/Core/Modules/perform/performController';
import { WebGAL } from '@/main';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { textSize } from '@/store/userDataInterface';

/**
 * 进行普通对话的显示
 * @param sentence 语句
 * @return {IPerform} 执行的演出
 */
export const say = (sentence: ISentence): IPerform => {
  const stageState = webgalStore.getState().stage;
  const styles = stageState.enableFilm === '' ? styles1 : styles2;
  const userDataState = webgalStore.getState().userData;
  const dispatch = webgalStore.dispatch;
  let dialogKey = Math.random().toString(); // 生成一个随机的key
  let dialogToShow = sentence.content; // 获取对话内容
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
  // 清除语音
  dispatch(setStage({ key: 'vocal', value: '' }));
  WebGAL.gameplay.performController.unmountPerform('vocal-play', true);
  // 设置key
  dispatch(setStage({ key: 'currentDialogKey', value: dialogKey }));
  // 计算延迟
  const textDelay = useTextDelay(userDataState.optionData.textSpeed);
  // 本句延迟
  const sentenceDelay = textDelay * sentence.content.length;

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

  // 播放一段语音
  if (vocal) {
    playVocal(sentence);
  }

  const performInitName: string = getRandomPerformName();
  let endDelay = 750 - userDataState.optionData.textSpeed * 250;
  // 如果有 notend 参数，那么就不需要等待
  if (isNotend) {
    endDelay = 0;
  }

  return {
    performName: performInitName,
    duration: sentenceDelay + endDelay,
    isHoldOn: false,
    stopFunction: () => {
      const textElements = document.querySelectorAll('.' + styles.TextBox_textElement_start);
      const textArray = [...textElements];
      textArray.forEach((e) => {
        e.className = styles.TextBox_textElement_Settled;
      });
    },
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
    goNextWhenOver: isNotend,
  };
};
