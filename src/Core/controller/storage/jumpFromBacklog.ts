import { getRef } from '../../store/storeRef';
import { logger } from '../../util/logger';
import { sceneFetcher } from '../../util/sceneFetcher';
import { runtime_currentSceneData } from '../../runtime/sceneData';
import { sceneParser } from '../../parser/sceneParser';
import * as _ from 'lodash';
import { runtime_gamePlay } from '../../runtime/gamePlay';
import { runtime_currentBacklog } from '../../runtime/backlog';
import { eventSender } from '../eventBus/eventSender';
import { IBacklogItem } from '../../interface/coreInterface/runtimeInterface';
import { IStageState } from '../../interface/stateInterface/stageInterface';

export const jumpFromBacklog = (index: number) => {
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
    runtime_currentSceneData.currentSentenceId = backlogFile.saveScene.currentSentenceId + 1;
    runtime_currentSceneData.sceneStack = _.cloneDeep(backlogFile.saveScene.sceneStack);

    // 强制停止所有演出
    logger.info('清除所有普通演出');
    for (let i = 0; i < runtime_gamePlay.performList.length; i++) {
        const e = runtime_gamePlay.performList[i];
        e.stopFunction();
        clearTimeout(e.stopTimeout);
        runtime_gamePlay.performList.splice(i, 1);
        i--;
    }

    // 弹出backlog项目到指定状态
    for (let i = runtime_currentBacklog.length - 1; i > index; i--) {
        runtime_currentBacklog.pop();
    }

    // 恢复舞台状态
    const newStageState: IStageState = _.cloneDeep(backlogFile.currentStageState);
    getRef('stageRef').restoreStage(newStageState);

    // 恢复演出
    eventSender('restorePerform_target', 0, 1);

    // 关闭backlog界面
    getRef('GuiRef').setVisibility('showBacklog', false);
};
