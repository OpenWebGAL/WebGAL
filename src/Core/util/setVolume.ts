import {getRef} from "../../Core/store/storeRef";
import { logger } from "./logger";

/**
 * 设置音量
 */
export const setVolume = ()=>{
    const userDataStore = getRef('userDataRef');
    const mainVol = userDataStore.userDataState.optionData.volumeMain;
    const vocalVol = mainVol * 0.01 * userDataStore.userDataState.optionData.vocalVolume * 0.01;
    const bgmVol = mainVol * 0.01 * userDataStore.userDataState.optionData.bgmVolume * 0.01;
    logger.info('设置音量',[vocalVol,bgmVol]);
    const bgmElement: any = document.getElementById('currentBgm');
    if (bgmElement) {
        bgmElement.volume = bgmVol;
        logger.info('当前的bgm音量',bgmElement.volume);
    }
    const vocalElement: any = document.getElementById('currentBgm');
    if (bgmElement) {
        vocalElement.volume = vocalVol;
    }
};
