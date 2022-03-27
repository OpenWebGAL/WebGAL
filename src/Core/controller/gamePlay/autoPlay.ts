import {runtime_gamePlay} from "../../runtime/gamePlay";
import {nextSentence} from "./nextSentence";

//切换自动播放状态
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
    nextSentence();
}