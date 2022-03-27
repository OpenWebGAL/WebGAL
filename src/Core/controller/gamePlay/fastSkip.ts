//切换自动播放状态
import {runtime_gamePlay} from "../../runtime/gamePlay";

export const stopFast = () => {
    runtime_gamePlay.isFast = false;
    if (runtime_gamePlay.fastInterval !== null) {
        clearInterval(runtime_gamePlay.fastInterval);
        runtime_gamePlay.fastInterval = null;
    }
}

export const stopAll = () => {
    runtime_gamePlay.isFast = false;
    if (runtime_gamePlay.fastInterval !== null) {
        clearInterval(runtime_gamePlay.fastInterval);
        runtime_gamePlay.fastInterval = null;
    }

    runtime_gamePlay.isAuto = false;
    if (runtime_gamePlay.autoInterval !== null) {
        clearInterval(runtime_gamePlay.autoInterval);
        runtime_gamePlay.autoInterval = null;
    }
}

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
            const event = new MouseEvent('auxclick', {
                'view': window,
                'bubbles': true,
                'cancelable': true
            });
            const textBox = document.getElementById('textBoxMain');
            if (textBox !== null) {
                textBox.dispatchEvent(event);
            }
        }, 100);
    }
}