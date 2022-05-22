import {ISentence} from '@/Core/interface/coreInterface/sceneInterface';
import {IPerform} from '@/Core/interface/coreInterface/performInterface';
import styles from '../../Components/Stage/TextBox/textbox.module.scss';
import {getRandomPerformName} from '@/Core/util/getRandomPerformName';
import {playVocal} from './playVocal';
import {webgalStore} from "@/Core/store/store";
import {setStage} from "@/Core/store/stageReducer";

/**
 * 进行普通对话的显示
 * @param sentence 语句
 * @return {IPerform} 执行的演出
 */
export const say = (sentence: ISentence): IPerform => {
  const stageState = webgalStore.getState().stage;
  const userDataState = webgalStore.getState().userData;
  const dispatch = webgalStore.dispatch;
  // 设置文本显示
  dispatch(setStage({key: "showText", value: sentence.content}));
  // 清除语音
  dispatch(setStage({key: "vocal", value: ''}));
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
  dispatch(setStage({key: "showName", value: showName}));
  setTimeout(() => {
    const textElements = document.querySelectorAll('.' + styles.TextBox_textElement_start);
    const textArray = [...textElements];
    textArray.forEach((e) => {
      e.className = styles.TextBox_textElement;
    });
  }, 0);
  const performInitName: string = getRandomPerformName();
  const textDelay = 55 - 20 * userDataState.optionData.textSpeed;
  const endDelay = 750 - userDataState.optionData.textSpeed * 250;
  return {
    performName: performInitName,
    duration: sentence.content.length * textDelay + endDelay,
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
  };
};
