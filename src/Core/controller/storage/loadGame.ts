import { RUNTIME_CURRENT_BACKLOG } from '../../runtime/backlog';
import { RUNTIME_SCENE_DATA } from '../../runtime/sceneData';
import { ISaveData } from '@/interface/stateInterface/userDataInterface';
import { logger } from '../../util/etc/logger';
import { sceneFetcher } from '../scene/sceneFetcher';
import { sceneParser } from '../../parser/sceneParser';
import { webgalStore } from '@/store/store';
import { resetStageState } from '@/store/stageReducer';
import { setVisibility } from '@/store/GUIReducer';
import { restorePerform } from './jumpFromBacklog';
import { stopAllPerform } from '@/Core/controller/gamePlay/stopAllPerform';
import cloneDeep from 'lodash/cloneDeep';

/**
 * 读取游戏存档
 * @param index 要读取的存档的档位
 */
export const loadGame = (index: number) => {
  const userDataState = webgalStore.getState().userData;
  // 获得存档文件
  const loadFile: ISaveData = userDataState.saveData[index];
  logger.debug('读取的存档数据', loadFile);
  // 加载存档
  loadGameFromStageData(loadFile);
};

export function loadGameFromStageData(stageData: ISaveData) {
  if (!stageData) {
    logger.info('暂无存档');
    return;
  }
  const loadFile = stageData;
  // 重新获取并同步场景状态
  sceneFetcher(loadFile.sceneData.sceneUrl).then((rawScene) => {
    RUNTIME_SCENE_DATA.currentScene = sceneParser(
      rawScene,
      loadFile.sceneData.sceneName,
      loadFile.sceneData.sceneUrl,
    );
  });
  RUNTIME_SCENE_DATA.currentSentenceId = loadFile.sceneData.currentSentenceId;
  RUNTIME_SCENE_DATA.sceneStack = cloneDeep(loadFile.sceneData.sceneStack);

  // 强制停止所有演出
  stopAllPerform();

  // 恢复backlog
  const newBacklog = loadFile.backlog;
  RUNTIME_CURRENT_BACKLOG.splice(0, RUNTIME_CURRENT_BACKLOG.length); // 清空原backlog
  for (const e of newBacklog) {
    RUNTIME_CURRENT_BACKLOG.push(e);
  }

  // 恢复舞台状态
  const newStageState = cloneDeep(loadFile.nowStageState);
  const dispatch = webgalStore.dispatch;
  dispatch(resetStageState(newStageState));

  // 恢复演出
  restorePerform();

  dispatch(setVisibility({ component: 'showTitle', visibility: false }));
  dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
}
