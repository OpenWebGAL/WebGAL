import cloneDeep from 'lodash/cloneDeep';
import { WebGAL } from '@/Core/WebGAL';
import { initState, stageStateManager } from '@/Core/Modules/stage/stageStateManager';

export const resetStage = (resetBacklog: boolean, resetSceneAndVar = true) => {
  /**
   * 清空运行时
   */
  if (resetBacklog) {
    WebGAL.backlogManager.makeBacklogEmpty();
  }
  // 清空sceneData，并重新获取
  if (resetSceneAndVar) {
    WebGAL.sceneManager.resetScene();
  }

  // 清空所有演出和timeOut
  WebGAL.gameplay.pixiStage?.removeAllAnimations();
  WebGAL.gameplay.performController.removeAllPerform();
  WebGAL.gameplay.resetGamePlay();

  // 清空舞台状态表
  const initSceneDataCopy = cloneDeep(initState);
  const currentVars = stageStateManager.getCalculationStageState().GameVar;
  stageStateManager.resetAllStageState(initSceneDataCopy);
  if (!resetSceneAndVar) {
    stageStateManager.setStageAndCommit('GameVar', currentVars);
  }
};
