import {scriptExecutor} from "./scriptExecutor";
import {runtime_gamePlay} from "../../runtime/gamePlay";
import {storeRef} from "../../store/storeRef";
import {IRunPerform} from "../../interface/perform";

export const nextSentence = () => {
    //检查是否存在 blockNext 的演出
    let isBlockingNext = false;
    runtime_gamePlay.performList.forEach(e => {
        if (e.blockingNext() && !e.isOver) //阻塞且没有结束
            isBlockingNext = true;
    })
    if (isBlockingNext) {
        return;
    }

    //检查是否处于演出完成状态，不是则结束所有普通演出（保持演出不算做普通演出）
    let allsettled = true;
    runtime_gamePlay.performList.forEach(e => {
        if (!e.isHoldOn)
            allsettled = false;
    })
    if (allsettled) {
        //清除演出序列（因为这时候已经准备进行下一句了）
        if (storeRef.stageRef) {
            const stageStore: any = storeRef.stageRef.current;
            for (let i = 0; i < stageStore.stageState.PerformList.length; i++) {
                const e: IRunPerform = stageStore.stageState.PerformList[i];
                if (!e.isHoldOn) {
                    stageStore.stageState.PerformList.splice(i, 1);
                    i--;
                }
            }
        }
        scriptExecutor();
        return;
    }

    //清除所有普通演出
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