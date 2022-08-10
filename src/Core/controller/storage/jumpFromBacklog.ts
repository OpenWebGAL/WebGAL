import { logger } from '../../util/etc/logger';
import { sceneFetcher } from '../scene/sceneFetcher';
import { runtime_currentSceneData } from '../../runtime/sceneData';
import { sceneParser } from '../../parser/sceneParser';
import { runtime_currentBacklog } from '../../runtime/backlog';
import { IBacklogItem } from '@/interface/coreInterface/runtimeInterface';
import { IStageState } from '@/interface/stateInterface/stageInterface';
import { webgalStore } from '@/store/store';
import { resetStageState } from '@/store/stageReducer';
import { setVisibility } from '@/store/GUIReducer';
import { runScript } from '@/Core/controller/gamePlay/runScript';
import { stopAllPerform } from '@/Core/controller/gamePlay/stopAllPerform';
import cloneDeep from 'lodash/cloneDeep';

/**
 * 恢复演出
 */
export const restorePerform = () => {
  const stageState = webgalStore.getState().stage;
  stageState.PerformList.forEach((e) => {
    runScript(e.script);
  });
};

/**
 * 从 backlog 跳转至一个先前的状态
 * @param index
 */
export const jumpFromBacklog = (index: number) => {
  const dispatch = webgalStore.dispatch;
  // 获得存档文件
  const backlogFile: IBacklogItem = runtime_currentBacklog[index];
  logger.debug('读取的backlog数据', backlogFile);
  // 重新获取并同步场景状态
  sceneFetcher(backlogFile.saveScene.sceneUrl).then((rawScene) => {
    runtime_currentSceneData.currentScene = sceneParser(
      rawScene,
      backlogFile.saveScene.sceneName,
      backlogFile.saveScene.sceneUrl,
    );
  });
  runtime_currentSceneData.currentSentenceId = backlogFile.saveScene.currentSentenceId;
  runtime_currentSceneData.sceneStack = cloneDeep(backlogFile.saveScene.sceneStack);

  // 强制停止所有演出
  stopAllPerform();

  // 弹出backlog项目到指定状态
  for (let i = runtime_currentBacklog.length - 1; i > index; i--) {
    runtime_currentBacklog.pop();
  }

  // 恢复舞台状态
  const newStageState: IStageState = cloneDeep(backlogFile.currentStageState);

  dispatch(resetStageState(newStageState));

  // 恢复演出
  restorePerform();

  // 关闭backlog界面
  dispatch(setVisibility({ component: 'showBacklog', visibility: false }));

  // 重新显示Textbox
  dispatch(setVisibility({ component: 'showTextBox', visibility: true }));
};
