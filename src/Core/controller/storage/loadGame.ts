import {getRef} from "../../store/storeRef";
import {runtime_currentBacklog} from "../../runtime/backlog";
import {runtime_currentSceneData} from "../../runtime/sceneData";
import {ISaveData} from "../../store/userData";
import {runtime_gamePlay} from "../../runtime/gamePlay";
import * as _ from 'lodash'
import {logger} from "../../util/logger";


/**
 * 读取游戏存档
 * @param index 要读取的存档的档位
 */
export const loadGame = (index: number) => {
    //获得存档文件
    const loadFile: ISaveData = getRef('userDataRef').userDataState.saveData[index];
    logger.debug('读取的存档数据', loadFile);
    //重新获取并同步场景状态
    runtime_currentSceneData.currentScene = loadFile.sceneData.currentScene;
    runtime_currentSceneData.currentSentenceId = loadFile.sceneData.currentSentenceId;
    runtime_currentSceneData.sceneStack = _.cloneDeep(loadFile.sceneData.sceneStack);

    //强制停止所有演出
    logger.info('清除所有普通演出')
    for (let i = 0; i < runtime_gamePlay.performList.length; i++) {
        const e = runtime_gamePlay.performList[i];
        e.stopFunction();
        clearTimeout(e.stopTimeout);
        runtime_gamePlay.performList.splice(i, 1);
        i--;
    }

    //恢复backlog
    const newBacklog = loadFile.backlog;
    runtime_currentBacklog.splice(0, runtime_currentBacklog.length);//清空原backlog
    for (const e of newBacklog) {
        runtime_currentBacklog.push(e);
    }

    //恢复舞台状态
    const newStageState = runtime_currentBacklog[runtime_currentBacklog.length - 1];
    getRef('stageRef').restoreStage(newStageState);

    //恢复演出
    setTimeout(() => {
        const event = new MouseEvent('click', {
            'view': window,
            'bubbles': true,
            'cancelable': true,
            'clientX': 0,
        });
        const textBox = document.getElementById('restorePerform_target');
        if (textBox !== null) {
            textBox.dispatchEvent(event);
        }
    }, 1);

    const GUIstate = getRef('GuiRef');
    GUIstate.setVisibility('showTitle', false);
    GUIstate.setVisibility('showMenuPanel', false);
}
