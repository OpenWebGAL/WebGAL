//切换自动播放状态
import {runtime_gamePlay} from "../../runtime/gamePlay";
import {nextSentence} from "./nextSentence";

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
        runtime_gamePlay.fastInterval = setInterval(nextSentence, 100);
    }
}