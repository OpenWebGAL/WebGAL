import {commandType, ISentence} from '../../../interface/coreInterface/sceneInterface';
import {IPerform, IRunPerform} from '../../../interface/coreInterface/performInterface';
import {runtime_gamePlay} from "../../../../Core/runtime/gamePlay";
import {logger} from "../../../../Core/util/logger";
import {getRef} from "../../../../Core/store/storeRef";

/**
 * 语句执行的模板代码
 * @param sentence
 */
export const pixiInit = (sentence: ISentence): IPerform => {
    runtime_gamePlay.performList.forEach((e) => {
            if (e.performName.match(/PixiPerform/)) {
                logger.warn('pixi 被脚本重新初始化', e.performName);
                /**
                 * 卸载演出
                 */
                for (let i = 0; i < runtime_gamePlay.performList.length; i++) {
                    const e2 = runtime_gamePlay.performList[i];
                    if (e2.performName === e.performName) {
                        e2.stopFunction();
                        clearTimeout(e2.stopTimeout);
                        runtime_gamePlay.performList.splice(i, 1);
                        i--;
                    }
                }
                /**
                 * 从状态表里清除演出
                 */
                const stageStore: any = getRef('stageRef');
                for (let i = 0; i < stageStore.stageState.PerformList.length; i++) {
                    const e2: IRunPerform = stageStore.stageState.PerformList[i];
                    if (e2.script.command === commandType.pixi) {
                        stageStore.stageState.PerformList.splice(i, 1);
                        i--;
                    }
                }
            }
        }
    );
    return {
        performName: 'none',
        duration: 0,
        isOver: false,
        isHoldOn: false,
        stopFunction: () => {
        },
        blockingNext: () => false,
        blockingAuto: () => true,
        stopTimeout: undefined, // 暂时不用，后面会交给自动清除
    };
};
