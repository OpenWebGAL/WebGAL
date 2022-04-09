import { logger } from './logger';
import { getRef } from '../store/storeRef';

/**
 * 播放bgm的实际执行函数
 * @param url bgm的路径
 */
export const playBgm = (url: string) => {
    logger.debug('播放bgm');
    // 先停止之前的bgm
    let VocalControl: any = document.getElementById('currentBgm');
    if (VocalControl !== null) {
        VocalControl.currentTime = 0;
        if (!VocalControl.paused) VocalControl.pause();
    }
    // 获得舞台状态并设置
    getRef('stageRef').setStage('bgm', url);
    // 播放语音
    setTimeout(() => {
        let VocalControl: any = document.getElementById('currentBgm');
        if (VocalControl !== null) {
            VocalControl.currentTime = 0;
            VocalControl.oncanplay = () => {
                VocalControl.play();
            };
        }
    }, 1);
};
