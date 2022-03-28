//切换自动播放状态
import {runtime_gamePlay} from "../../runtime/gamePlay";
import {stopAuto} from "./autoPlay";
import {eventSender} from "../eventBus/eventSender";

/**
 * 停止快进模式
 */
export const stopFast = () => {
    runtime_gamePlay.isFast = false;
    if (runtime_gamePlay.fastInterval !== null) {
        clearInterval(runtime_gamePlay.fastInterval);
        runtime_gamePlay.fastInterval = null;
    }
}

/**
 * 停止快进模式与自动播放
 */
export const stopAll = () => {
    stopFast();
    stopAuto();
}


/**
 * 切换快进模式
 */
export const switchFast = () => {
    //现在正在快进
    if (runtime_gamePlay.isFast) {
        runtime_gamePlay.isFast = false;
        if (runtime_gamePlay.fastInterval !== null) {
            clearInterval(runtime_gamePlay.fastInterval);
            runtime_gamePlay.fastInterval = null;
        }
    } else { //当前不在快进
        runtime_gamePlay.isFast = true;
        runtime_gamePlay.fastInterval = setInterval(() => {
            eventSender('nextSentence_target', 0, 0);
        }, 100);
    }
}