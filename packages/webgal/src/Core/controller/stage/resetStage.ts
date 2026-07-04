import cloneDeep from 'lodash/cloneDeep';
import { WebGAL } from '@/Core/WebGAL';
import type { IStageCommitOptions } from '@/Core/Modules/stage/stageStateManager';
import { initState, stageStateManager } from '@/Core/Modules/stage/stageStateManager';
import { stopFast } from '@/Core/controller/gamePlay/fastSkip';

export interface ResetStageOptions extends IStageCommitOptions {
  commitStageState?: boolean;
}

export const resetStage = (resetBacklog: boolean, resetSceneAndVar = true, options: ResetStageOptions = {}) => {
  const { commitStageState = true, ...commitOptions } = options;
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
  stopFast();
  WebGAL.gameplay.performController.removeAllPerform();
  WebGAL.gameplay.resetGamePlay();

  // 清空舞台状态表
  const initSceneDataCopy = cloneDeep(initState);
  const currentVars = stageStateManager.getCalculationStageState().GameVar;
  if (commitStageState) {
    stageStateManager.resetAllStageState(initSceneDataCopy, {
      ...commitOptions,
      skipAnimation: commitOptions.skipAnimation ?? true,
    });
  } else {
    stageStateManager.resetCalculationStageState(initSceneDataCopy);
  }
  if (!resetSceneAndVar) {
    if (commitStageState) {
      stageStateManager.setStageAndCommit('GameVar', currentVars, commitOptions);
    } else {
      stageStateManager.setStage('GameVar', currentVars);
    }
  }
};
