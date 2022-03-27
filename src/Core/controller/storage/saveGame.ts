import {getRef} from "../../store/storeRef";
import * as _ from 'lodash'
import {runtime_currentBacklog} from "../../runtime/backlog";
import {logger} from "../../util/logger";
import {ISaveData} from "../../store/userData";
import {IStageState} from "../../store/stage";
import {ISceneData, runtime_currentSceneData} from "../../runtime/sceneData";
import {setStorage} from "./storageController";

export const saveGame = (index: number) => {
    const userDataRef = getRef('userDataRef');
    const saveBacklog = _.cloneDeep(runtime_currentBacklog);
    const saveData: ISaveData = {
        backlog: saveBacklog, //舞台数据
        index: index,//存档的序号
        saveTime: (new Date).toString(),//保存时间
        sceneData: _.cloneDeep(runtime_currentSceneData),//场景数据
    }
    const newSaveData = userDataRef.userDataState.saveData;
    newSaveData[index] = saveData;
    userDataRef.setUserData('saveData', [...newSaveData]);
    logger.debug('存档完成', userDataRef.userDataState);
    setStorage();
}