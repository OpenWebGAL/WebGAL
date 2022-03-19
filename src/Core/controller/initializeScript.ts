/**
 * @file 引擎初始化时会执行的脚本，包括获取游戏信息，初始化运行时变量，初始化用户数据存储
 */

import {logger} from "../util/logger";
import {infoFetcher} from "../assetsFetcher/infoFetcher";
import {resize} from "../util/resize";

/**
 * 引擎初始化函数
 */
export const initializeScript = (): void => {
    //打印初始log信息
    logger.info('WebGAL 3.9.7');
    logger.info('Github: https://github.com/MakinoharaShoko/WebGAL ');
    logger.info('Made with ❤ by MakinoharaShoko');
    //激活强制缩放
    //在调整窗口大小时重新计算宽高，设计稿按照 1600*900。
    setTimeout(resize, 100)
    resize();
    window.onresize = resize;
    document.onkeydown = function (event) {
        const e = event  || arguments.callee.caller.arguments[0];
        if (e && e.keyCode == 122) {
            setTimeout(() => {
                resize();
            }, 100);
        }
    };
    //获取游戏信息
    infoFetcher('./game/config.txt');

}