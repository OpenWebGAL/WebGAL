import {ISentence} from "../../../interface/scene";
import {IPerform} from "../../../interface/perform";
import {playBgm} from "../../../util/playBgm";

/**
 * 播放一段bgm
 * @param sentence
 */
export const bgm = (sentence: ISentence): IPerform => {
    let url: string = sentence.content;//获取bgm的url
    playBgm(url);
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