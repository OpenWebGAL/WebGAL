import { commandType, ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform, IRunPerform } from '@/Core/Modules/perform/performInterface';
import { logger } from '@/Core/util/etc/logger';
import { webgalStore } from '@/store/store';
import { resetStageState } from '@/store/stageReducer';
import cloneDeep from 'lodash/cloneDeep';

import { WebGAL } from '@/Core/WebGAL';

/**
 * 初始化pixi
 * @param sentence
 */
export const pixiInit = (sentence: ISentence): IPerform => {
  WebGAL.gameplay.performController.performList.forEach((e) => {
    if (e.performName.match(/PixiPerform/)) {
      logger.warn('pixi 被脚本重新初始化', e.performName);
      /**
       * 卸载演出
       */
      for (let i = 0; i < WebGAL.gameplay.performController.performList.length; i++) {
        const e2 = WebGAL.gameplay.performController.performList[i];
        if (e2.performName === e.performName) {
          e2.stopFunction();
          clearTimeout(e2.stopTimeout as unknown as number);
          WebGAL.gameplay.performController.performList.splice(i, 1);
          i--;
        }
      }
      /**
       * 从状态表里清除演出
       */
      const stageState = webgalStore.getState().stage;
      const newStageState = cloneDeep(stageState);
      for (let i = 0; i < newStageState.PerformList.length; i++) {
        const e2: IRunPerform = newStageState.PerformList[i];
        if (e2.script.command === commandType.pixi) {
          newStageState.PerformList.splice(i, 1);
          i--;
        }
      }
      webgalStore.dispatch(resetStageState(newStageState));
    }
  });
  return {
    performName: 'none',
    duration: 0,
    isHoldOn: false,
    stopFunction: () => {},
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
