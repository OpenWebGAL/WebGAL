import {scriptExecutor} from "./scriptExecutor";
import {runtime_gamePlay} from "../../runtime/gamePlay";
import {getRef} from "../../store/storeRef";
import {IRunPerform} from "../../interface/perform";
import {logger} from "../../util/logger";


/**
 * 进行下一句
 */
export const nextSentence = () => {

    //第一步，检查是否存在 blockNext 的演出
    let isBlockingNext = false;
    runtime_gamePlay.performList.forEach(e => {
        if (e.blockingNext() && !e.isOver) //阻塞且没有结束的演出
            isBlockingNext = true;
    })
    if (isBlockingNext) { //有阻塞，提前结束
        logger.warn('next 被阻塞')
        return;
    }

    //检查是否处于演出完成状态，不是则结束所有普通演出（保持演出不算做普通演出）
    let allSettled = true;
    runtime_gamePlay.performList.forEach(e => {
        if (!e.isHoldOn)
            allSettled = false;
    })
    if (allSettled) { // 所有普通演出已经结束
        //清除状态表的演出序列（因为这时候已经准备进行下一句了）
        const stageStore: any = getRef('stageRef');
        for (let i = 0; i < stageStore.stageState.PerformList.length; i++) {
            const e: IRunPerform = stageStore.stageState.PerformList[i];
            if (!e.isHoldOn) {
                stageStore.stageState.PerformList.splice(i, 1);
                i--;
            }
        }

        scriptExecutor();
        return;
    }

    //不处于 allSettled 状态，清除所有普通演出，强制进入settled。
    logger.info('清除普通演出')
    for (let i = 0; i < runtime_gamePlay.performList.length; i++) {
        const e = runtime_gamePlay.performList[i];
        if (!e.isHoldOn) {
            e.stopFunction();
            clearTimeout(e.stopTimeout);
            runtime_gamePlay.performList.splice(i, 1);
            i--;
        }
    }

}