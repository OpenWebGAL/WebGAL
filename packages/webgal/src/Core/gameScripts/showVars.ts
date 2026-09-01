import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
import { webgalStore } from '@/store/store';
import { logger } from '@/Core/util/logger';
import { getRandomPerformName } from '@/Core/Modules/perform/performController';
import { PERFORM_CONFIG } from '@/config';
import { WebGAL } from '@/Core/WebGAL';
import { stageStateManager } from '@/Core/Modules/stage/stageStateManager';

/**
 * 进行普通对话的显示
 * @param sentence 语句
 * @return {IPerform} 执行的演出
 */
export const showVars = (sentence: ISentence): IPerform => {
  const stageState = stageStateManager.getCalculationStageState();
  const userDataState = webgalStore.getState().userData;
  // 设置文本显示
  // 顺序与变量查找链一致：当前帧局部变量 -> 舞台变量 -> 全局变量
  const allVar = {
    localGameVar: WebGAL.sceneManager.sceneData.currentLocals,
    stageGameVar: stageState.GameVar,
    globalGameVar: userDataState.globalGameVar,
  };
  stageStateManager.setStage('showText', JSON.stringify(allVar));
  stageStateManager.setStage('showName', '展示变量');
  logger.debug('展示变量：', allVar);
  const performInitName: string = getRandomPerformName();
  const endDelay = 750 - userDataState.optionData.textSpeed * 250;
  return {
    performName: performInitName,
    duration: endDelay,
    isHoldOn: false,
    startFunction: () => {
      WebGAL.events.textSettle.emit();
    },
    stopFunction: () => {
      WebGAL.events.textSettle.emit();
    },
    blockingNext: () => false,
    blockingAuto: () => true,
  };
};
