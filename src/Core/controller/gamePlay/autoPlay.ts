import {runtime_gamePlay} from "../../runtime/gamePlay";
import {eventSender} from "../eventBus/eventSender";
import {logger} from "../../util/logger";


/**
 * 停止自动播放
 */
export const stopAuto = () => {
    runtime_gamePlay.isAuto = false;
    if (runtime_gamePlay.autoInterval !== null) {
        clearInterval(runtime_gamePlay.autoInterval);
        runtime_gamePlay.autoInterval = null;
    }
    if (runtime_gamePlay.autoTimeout !== null) {
        clearTimeout(runtime_gamePlay.autoTimeout);
        runtime_gamePlay.autoTimeout = null;
    }
}

/**
 * 切换自动播放状态
 */
export const switchAuto = () => {
    //现在正在自动播放
    if (runtime_gamePlay.isAuto) {
        runtime_gamePlay.isAuto = false;
        if (runtime_gamePlay.autoInterval !== null) {
            clearInterval(runtime_gamePlay.autoInterval);
            runtime_gamePlay.autoInterval = null;
        }
    } else { //当前不在自动播放
        runtime_gamePlay.isAuto = true;
        runtime_gamePlay.autoInterval = setInterval(autoPlay, 100);
    }
}

const autoPlay = () => {
    let isBlockingAuto = false;
    runtime_gamePlay.performList.forEach(e => {
        if (e.blockingAuto() && !e.isOver) //阻塞且没有结束的演出
            isBlockingAuto = true;
    })
    if (isBlockingAuto) { //有阻塞，提前结束
        return;
    }
    // nextSentence();
    if (runtime_gamePlay.autoTimeout === null) {
        logger.warn('nextSentenceEvent Sended')
        runtime_gamePlay.autoTimeout = eventSender('nextSentence_target', 0, 500);
    }
}