import {ISentence} from "../../../interface/scene";
import {IPerform} from "../../../interface/perform";
import styles from "../../../../Components/Stage/mainStage.module.scss";
import {getRandomPerformName} from "../../../util/getRandomPerformName";
import {getRef} from "../../../store/storeRef";
import {runtime_gamePlay} from "../../../runtime/gamePlay";

const playVocal = (sentence: ISentence): IPerform => {
    const performInitName: string = getRandomPerformName();
    let url: string = '';//获取语音的url
    for (const e of sentence.args) {
        if (e.key === 'vocal') {
            url = e.value.toString();
        }
    }
    //先停止之前的语音
    let VocalControl: any = document.getElementById("currentVocal");
    if (VocalControl !== null) {
        VocalControl.currentTime = 0;
        VocalControl.pause();
    }
    getRef('stageRef').setStage('vocal', url);
    setTimeout(() => {
        let VocalControl: any = document.getElementById("currentVocal");
        if (VocalControl !== null) {
            VocalControl.currentTime = 0;
            VocalControl.oncanplay = () => VocalControl.play();
            VocalControl.ended = () => {
                for (const e of runtime_gamePlay.performList) {
                    if (e.performName === performInitName) {
                        e.isOver = true;
                    }
                }
            }
        }
    }, 1)
    return {
        performName: performInitName,
        duration: 1000 * 60 * 60,
        isOver: false,
        isHoldOn: false,
        stopFunction: () => {
        },
        blockingNext: () => false,
        blockingAuto: () => true,
        stopTimeout: undefined,//暂时不用，后面会交给自动清除
    };
}