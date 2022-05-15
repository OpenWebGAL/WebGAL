import {commandType, ISentence} from '@/Core/interface/coreInterface/sceneInterface';
import {IPerform, IRunPerform} from '@/Core/interface/coreInterface/performInterface';
import {runtime_gamePlay} from "@/Core/runtime/gamePlay";
import {logger} from "@/Core/util/logger";
import {webgalStore} from "@/Core/store/store";
import _ from 'lodash';
import {resetStageState} from "@/Core/store/stageReducer";

/**
 * 初始化pixi
 * @param sentence
 */
export const pixiInit = (sentence: ISentence): IPerform => {
  runtime_gamePlay.performList.forEach((e) => {
    if (e.performName.match(/PixiPerform/)) {
      logger.warn('pixi 被脚本重新初始化', e.performName);
      /**
                 * 卸载演出
                 */
      for (let i = 0; i < runtime_gamePlay.performList.length; i++) {
        const e2 = runtime_gamePlay.performList[i];
        if (e2.performName === e.performName) {
          e2.stopFunction();
          clearTimeout(e2.stopTimeout);
          runtime_gamePlay.performList.splice(i, 1);
          i--;
        }
      }
      /**
                 * 从状态表里清除演出
                 */
      const stageState = webgalStore.getState().stage;
      const newStageState = _.cloneDeep(stageState);
      for (let i = 0; i < newStageState.PerformList.length; i++) {
        const e2: IRunPerform = newStageState.PerformList[i];
        if (e2.script.command === commandType.pixi) {
          newStageState.PerformList.splice(i, 1);
          i--;
        }
      }
      webgalStore.dispatch(resetStageState(newStageState));
    }
  }
  );
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
