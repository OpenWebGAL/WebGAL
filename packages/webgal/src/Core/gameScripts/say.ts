import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/controller/perform/performInterface';
import styles1 from '../../Components/Stage/TextBox/textbox.module.scss';
import styles2 from '../../Components/Stage/TextBox/textboxFilm.module.scss';
import { getRandomPerformName } from '@/Core/controller/perform/getRandomPerformName';
import { playVocal } from './playVocal';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { PERFORM_CONFIG } from '@/Core/config/performConfig';
import { useTextDelay } from '@/hooks/useTextOptions';

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
  let dialogToShow = sentence.content;
  let dialogKey = Math.random().toString();
  // 是否是继承语句
  let isConcat = false;
  // 是否有 notend 参数
  let isNotend = false;
  // 如果是concat，那么就继承上一句的key，并且继承上一句对话。
  sentence.args.forEach((e) => {
    if (e.key === 'concat' && e.value === true) {
      dialogKey = stageState.currentDialogKey;
      dialogToShow = stageState.showText + dialogToShow;
      isConcat = true;
    }
    if (e.key === 'notend' && e.value === true) {
      isNotend = true;
    }
  });
  if (isConcat) {
    dispatch(setStage({ key: 'currentConcatDialogPrev', value: stageState.showText }));
  } else {
    dispatch(setStage({ key: 'currentConcatDialogPrev', value: '' }));
  }
  // 设置文本显示
  dispatch(setStage({ key: 'showText', value: dialogToShow }));
  // 清除语音
  dispatch(setStage({ key: 'vocal', value: '' }));
  // 设置key
  dispatch(setStage({ key: 'currentDialogKey', value: dialogKey }));
  // 计算延迟
  const textDelay = useTextDelay(userDataState.optionData.textSpeed);
  // 本句延迟
  const sentenceDelay = textDelay * sentence.content.length;
  // // 设置延迟
  // if (isNotend) {
  //   dispatch(setStage({key: 'currentPerformDelay', value: sentenceDelay}));
  // } else {
  //   dispatch(setStage({key: 'currentPerformDelay', value: 0}));
  // }
  // 设置显示的角色名称
  let showName: string | number | boolean = stageState.showName; // 先默认继承
  for (const e of sentence.args) {
    if (e.key === 'speaker') {
      showName = e.value;
    }
    if (e.key === 'clear' && e.value === true) {
      showName = '';
    }
    if (e.key === 'vocal') {
      playVocal(sentence);
    }
  }
  dispatch(setStage({ key: 'showName', value: showName }));
  setTimeout(() => {
    const textElements = document.querySelectorAll('.' + styles.TextBox_textElement_start);
    const textArray = [...textElements];
    textArray.forEach((e) => {
      e.className = styles.TextBox_textElement;
    });
  }, 0);
  const performInitName: string = getRandomPerformName();
  let endDelay = 750 - userDataState.optionData.textSpeed * 250;
  if (isNotend) {
    endDelay = 0;
  }
  return {
    performName: performInitName,
    duration: sentenceDelay + endDelay,
    isOver: false,
    isHoldOn: false,
    stopFunction: () => {
      const textElements = document.querySelectorAll('.' + styles.TextBox_textElement);
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
