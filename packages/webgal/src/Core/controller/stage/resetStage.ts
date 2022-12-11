import { RUNTIME_CURRENT_BACKLOG } from '@/Core/runtime/backlog';
import { initSceneData, RUNTIME_SCENE_DATA } from '@/Core/runtime/sceneData';
import { RUNTIME_GAMEPLAY } from '@/Core/runtime/gamePlay';
import { initState, resetStageState, setStage } from '@/store/stageReducer';
import { webgalStore } from '@/store/store';
import cloneDeep from 'lodash/cloneDeep';

export const resetStage = (resetBacklog: boolean, resetSceneAndVar = true) => {
  /**
   * 清空运行时
   */
  if (resetBacklog) {
    RUNTIME_CURRENT_BACKLOG.splice(0, RUNTIME_CURRENT_BACKLOG.length); // 清空backlog
  }
  // 清空sceneData，并重新获取
  if (resetSceneAndVar) {
    RUNTIME_SCENE_DATA.currentSentenceId = 0;
    RUNTIME_SCENE_DATA.sceneStack = [];
    RUNTIME_SCENE_DATA.currentScene = cloneDeep(initSceneData.currentScene);
  }

  // 清空所有演出和timeOut
  for (const e of RUNTIME_GAMEPLAY.performList) {
    e.stopFunction();
  }
  RUNTIME_GAMEPLAY.performList = [];
  for (const e of RUNTIME_GAMEPLAY.timeoutList) {
    clearTimeout(e);
  }
  RUNTIME_GAMEPLAY.timeoutList = [];
  RUNTIME_GAMEPLAY.isAuto = false;
  RUNTIME_GAMEPLAY.isFast = false;
  const autoInterval = RUNTIME_GAMEPLAY.autoInterval;
  if (autoInterval !== null) clearInterval(autoInterval);
  RUNTIME_GAMEPLAY.autoInterval = null;
  const fastInterval = RUNTIME_GAMEPLAY.fastInterval;
  if (fastInterval !== null) clearInterval(fastInterval);
  RUNTIME_GAMEPLAY.fastInterval = null;
  const autoTimeout = RUNTIME_GAMEPLAY.autoTimeout;
  if (autoTimeout !== null) clearInterval(autoTimeout);
  RUNTIME_GAMEPLAY.autoTimeout = null;

  // 清空舞台状态表
  const initSceneDataCopy = cloneDeep(initState);
  const currentVars = webgalStore.getState().stage.GameVar;
  webgalStore.dispatch(resetStageState(initSceneDataCopy));
  if (!resetSceneAndVar) {
    webgalStore.dispatch(setStage({ key: 'GameVar', value: currentVars }));
  }
};
