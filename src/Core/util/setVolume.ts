import {getRef} from "../../Core/store/storeRef";
import { logger } from "./logger";

/**
 * 设置音量
 */
export const setVolume = ()=>{
    const userDataStore = getRef('userDataRef')!.current;
    const mainVol = userDataStore!.userDataState.optionData.volumeMain;
    const vocalVol = mainVol * 0.01 * userDataStore!.userDataState.optionData.vocalVolume * 0.01;
    const bgmVol = mainVol * 0.01 * userDataStore!.userDataState.optionData.bgmVolume * 0.01;
    logger.debug(`设置背景音量：${bgmVol},语音音量：${vocalVol}`);
    const bgmElement: any = document.getElementById('currentBgm');
    if (bgmElement) {
        bgmElement.volume = bgmVol.toString();
    }
    const vocalElement: any = document.getElementById('currentVocal');
    if (bgmElement) {
        vocalElement.volume = vocalVol.toString();
    }
};
