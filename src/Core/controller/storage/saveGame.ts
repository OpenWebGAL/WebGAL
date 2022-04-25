import { getRef } from '../../store/storeRef';
import * as _ from 'lodash';
import { runtime_currentBacklog } from '../../runtime/backlog';
import { logger } from '../../util/logger';
import { ISaveData } from '../../interface/stateInterface/userDataInterface';
import { runtime_currentSceneData } from '../../runtime/sceneData';
import { setStorage, syncStorageFast } from './storageController';

/**
 * 保存游戏
 * @param index 游戏的档位
 */
export const saveGame = (index: number) => {
    const userDataRef = getRef('userDataRef')!.current;
    const saveBacklog = _.cloneDeep(runtime_currentBacklog);
    const saveData: ISaveData = {
        nowStageState: _.cloneDeep(getRef('stageRef')!.current!.stageState),
        backlog: saveBacklog, // 舞台数据
        index: index, // 存档的序号
        saveTime: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString('chinese', { hour12: false }), // 保存时间
        sceneData: {
            currentSentenceId: runtime_currentSceneData.currentSentenceId, // 当前语句ID
            sceneStack: _.cloneDeep(runtime_currentSceneData.sceneStack), // 场景栈
            sceneName: runtime_currentSceneData.currentScene.sceneName, // 场景名称
            sceneUrl: runtime_currentSceneData.currentScene.sceneUrl, // 场景url
        }, // 场景数据
    };
    const newSaveData = userDataRef!.userDataState!.saveData;
    newSaveData[index] = saveData;
    userDataRef!.setUserData('saveData', [...newSaveData]);
    logger.debug('存档完成，存档结果：', userDataRef!.userDataState);
    syncStorageFast();
};
