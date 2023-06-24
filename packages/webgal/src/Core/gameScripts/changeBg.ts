import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
// import {getRandomPerformName} from '../../../util/getRandomPerformName';
import styles from '../../Components/Stage/stage.module.scss';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { WebGAL } from '@/main';

/**
 * 进行背景图片的切换
 * @param sentence 语句
 * @return {IPerform}
 */
export const changeBg = (sentence: ISentence): IPerform => {
  const dispatch = webgalStore.dispatch;
  if (getSentenceArgByKey(sentence, 'enter')) {
    WebGAL.animationManager.nextEnterAnimationName.set('bg-main', getSentenceArgByKey(sentence, 'enter')!.toString());
  }
  if (getSentenceArgByKey(sentence, 'exit')) {
    WebGAL.animationManager.nextExitAnimationName.set('bg-main-off', getSentenceArgByKey(sentence, 'exit')!.toString());
  }
  dispatch(setStage({ key: 'bgName', value: sentence.content }));

  return {
    performName: 'none',
    duration: 1000,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
