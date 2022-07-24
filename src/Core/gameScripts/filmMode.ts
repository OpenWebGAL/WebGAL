import {ISentence} from '@/interface/coreInterface/sceneInterface';
import {IPerform} from '@/interface/coreInterface/performInterface';
import {webgalStore} from "@/store/store";
import {setStage} from "@/store/stageReducer";

/**
 * 语句执行的模板代码
 * @param sentence
 */
export const filmMode = (sentence: ISentence): IPerform => {
  if (sentence.content !== '' && sentence.content !== 'none') {
    webgalStore.dispatch(setStage({key: 'enableFilm', value: sentence.content}));
  } else {
    webgalStore.dispatch(setStage({key: 'enableFilm', value: ''}));
  }
  return {
    performName: 'none',
    duration: 0,
    isOver: false,
    isHoldOn: false,
    stopFunction: () => {
    },
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
