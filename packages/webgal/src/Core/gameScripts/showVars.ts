import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';
import { logger } from '@/Core/util/etc/logger';
import { getRandomPerformName } from '@/Core/Modules/perform/performController';
import { PERFORM_CONFIG } from '@/Core/config/config';
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
  dispatch(setStage({ key: 'showText', value: JSON.stringify(stageState.GameVar) }));
  dispatch(setStage({ key: 'showName', value: '展示变量' }));
  logger.debug('展示变量：', stageState.GameVar);
  setTimeout(() => {
    WebGAL.eventBus.emit('text-settle');
  }, 0);
  const performInitName: string = getRandomPerformName();
  const textDelay = PERFORM_CONFIG.textInitialDelay - 20 * userDataState.optionData.textSpeed;
  const endDelay = 750 - userDataState.optionData.textSpeed * 250;
  return {
    performName: performInitName,
    duration: sentence.content.length * textDelay + endDelay,
    isHoldOn: false,
    stopFunction: () => {
      WebGAL.eventBus.emit('text-settle');
    },
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
