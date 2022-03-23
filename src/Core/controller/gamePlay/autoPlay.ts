import {runtime_gamePlay} from "../../runtime/gamePlay";
import {nextSentence} from "./nextSentence";

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