import {runtime_currentBacklog} from '../../runtime/backlog';
import {runtime_currentSceneData} from '../../runtime/sceneData';
import {ISaveData} from '../../interface/stateInterface/userDataInterface';
import {runtime_gamePlay} from '../../runtime/gamePlay';
import * as _ from 'lodash';
import {logger} from '../../util/logger';
import {sceneFetcher} from '../../util/sceneFetcher';
import {sceneParser} from '../../parser/sceneParser';
import {webgalStore} from "@/Core/store/store";
import {resetStageState} from "@/Core/store/stageReducer";
import {setVisibility} from "@/Core/store/GUIReducer";
import { restorePerform } from './jumpFromBacklog';
import {stopAllPerform} from "@/Core/controller/gamePlay/stopAllPerform";

/**
 * 读取游戏存档
 * @param index 要读取的存档的档位
 */
export const loadGame = (index: number) => {
  const userDataState = webgalStore.getState().userData;
  // 获得存档文件
  const loadFile: ISaveData = userDataState.saveData[index];
  logger.debug('读取的存档数据', loadFile);
  // 重新获取并同步场景状态
  sceneFetcher(loadFile.sceneData.sceneUrl).then((rawScene) => {
    runtime_currentSceneData.currentScene = sceneParser(
      rawScene,
      loadFile.sceneData.sceneName,
      loadFile.sceneData.sceneUrl,
    );
  });
  runtime_currentSceneData.currentSentenceId = loadFile.sceneData.currentSentenceId;
  runtime_currentSceneData.sceneStack = _.cloneDeep(loadFile.sceneData.sceneStack);

  // 强制停止所有演出
  stopAllPerform();

  // 恢复backlog
  const newBacklog = loadFile.backlog;
  runtime_currentBacklog.splice(0, runtime_currentBacklog.length); // 清空原backlog
  for (const e of newBacklog) {
    runtime_currentBacklog.push(e);
  }

  // 恢复舞台状态
  const newStageState = _.cloneDeep(loadFile.nowStageState);
  const dispatch = webgalStore.dispatch;
  dispatch(resetStageState(newStageState));

  // 恢复演出
  restorePerform();

  dispatch(setVisibility({component: 'showTitle', visibility: false}));
  dispatch(setVisibility({component: 'showMenuPanel', visibility: false}));
};
