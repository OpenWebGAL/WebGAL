import {ISentence} from "../../../interface/scene";
import {IPerform} from "../../../interface/perform";
import {logger} from "../../../util/logger";
import {getRef} from "../../../store/storeRef";

export const bgm = (sentence: ISentence): IPerform => {
    logger.debug('单次播放bgm')
    let url: string = sentence.content;//获取bgm的url
    //先停止之前的bgm
    let VocalControl: any = document.getElementById("currentBgm");
    if (VocalControl !== null) {
        VocalControl.currentTime = 0;
        if (!VocalControl.paused)
            VocalControl.pause();
    }
    //获得舞台状态并设置
    getRef('stageRef').setStage('bgm', url);
    //播放语音
    setTimeout(() => {
        let VocalControl: any = document.getElementById("currentBgm");
        if (VocalControl !== null) {
            VocalControl.currentTime = 0;
            VocalControl.oncanplay = () => {
                VocalControl.play();
            }
        }
    }, 1);

    return {
        performName: 'none',
        duration: 0,
        isOver: false,
        isHoldOn: true,
        stopFunction: () => {
        },
        blockingNext: () => false,
        blockingAuto: () => true,
        stopTimeout: undefined,//暂时不用，后面会交给自动清除
    };
}