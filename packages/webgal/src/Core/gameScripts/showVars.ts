import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { logger } from '@/Core/util/logger';
import { getRandomPerformName } from '@/Core/Modules/perform/performController';
import { PERFORM_CONFIG } from '@/config';
import { WebGAL } from '@/Core/WebGAL';

/**
 * 进行普通对话的显示
 * @param sentence 语句
 * @return {IPerform} 执行的演出
 */
export const showVars = (sentence: ISentence): IPerform => {
  const stageState = webgalStore.getState().stage;
  const userDataState = webgalStore.getState().userData;
  const dispatch = webgalStore.dispatch;
  // 设置文本显示
  const allVar = {
    stageGameVar: stageState.GameVar,
    globalGameVar: userDataState.globalGameVar,
  };
  dispatch(setStage({ key: 'showText', value: JSON.stringify(allVar) }));
  dispatch(setStage({ key: 'showName', value: '展示变量' }));
  logger.debug('展示变量：', allVar);
  setTimeout(() => {
    WebGAL.events.textSettle.emit();
  }, 0);
  const performInitName: string = getRandomPerformName();
  const endDelay = 750 - userDataState.optionData.textSpeed * 250;
  return {
    performName: performInitName,
    duration: endDelay,
    isHoldOn: false,
    stopFunction: () => {
      WebGAL.events.textSettle.emit();
    },
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
