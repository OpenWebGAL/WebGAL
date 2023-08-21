import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
// import {getRandomPerformName} from '../../../util/getRandomPerformName';
import styles from '../../Components/Stage/stage.module.scss';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { getSentenceArgByKey } from '@/Core/util/getSentenceArg';
import { WebGAL } from '@/main';
import { unlockCgInUserData } from '@/store/userDataReducer';
import { logger } from '@/Core/util/etc/logger';

/**
 * 进行背景图片的切换
 * @param sentence 语句
 * @return {IPerform}
 */
export const changeBg = (sentence: ISentence): IPerform => {
  const url = sentence.content;
  let name = sentence.content;
  let series = 'default';
  sentence.args.forEach((e) => {
    if (e.key === 'unlockname') {
      name = e.value.toString();
    }
    if (e.key === 'series') {
      series = e.value.toString();
    }
  });
  webgalStore.dispatch(unlockCgInUserData({ name, url, series }));
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
