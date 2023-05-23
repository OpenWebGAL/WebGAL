import { RUNTIME_GAMEPLAY } from '../../runtime/gamePlay';
import { webgalStore } from '@/store/store';
import cloneDeep from 'lodash/cloneDeep';
import { IRunPerform } from '@/Core/controller/perform/performInterface';
import { commandType } from '@/Core/controller/scene/sceneInterface';
import { resetStageState } from '@/store/stageReducer';

/**
 * 卸载演出
 * @param name 演出的名称
 */
export const unmountPerform = (name: string) => {
  for (let i = 0; i < RUNTIME_GAMEPLAY.performList.length; i++) {
    const e = RUNTIME_GAMEPLAY.performList[i];
    if (!e.isHoldOn && e.performName === name) {
      e.stopFunction();
      clearTimeout(e.stopTimeout as unknown as number);
      RUNTIME_GAMEPLAY.performList.splice(i, 1);
      i--;
    }
  }
};

export const unmountPerformForce = (name: string) => {
  for (let i = 0; i < RUNTIME_GAMEPLAY.performList.length; i++) {
    const e = RUNTIME_GAMEPLAY.performList[i];
    if (e.performName === name) {
      e.stopFunction();
      clearTimeout(e.stopTimeout as unknown as number);
      RUNTIME_GAMEPLAY.performList.splice(i, 1);
      i--;

      /**
       * 从状态表里清除演出
       */
      const stageState = webgalStore.getState().stage;
      const newStageState = cloneDeep(stageState);
      for (let i = 0; i < newStageState.PerformList.length; i++) {
        const e2: IRunPerform = newStageState.PerformList[i];
        if (e2.id === name) {
          newStageState.PerformList.splice(i, 1);
          i--;
        }
      }
      webgalStore.dispatch(resetStageState(newStageState));
    }
  }
};
