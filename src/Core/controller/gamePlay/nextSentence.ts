import {scriptExecutor} from "./scriptExecutor";
import {runtime_gamePlay} from "../../runtime/gamePlay";

export const nextSentence = () => {
    //检查是否存在blockNext 的演出
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