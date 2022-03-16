/**
 * @file
 * 引擎初始化时会执行的脚本，包括获取游戏信息，初始化运行时变量，初始化用户数据存储
 */

import {logger} from "../util/logger";
import {infoFetcher} from "../assetsFetcher/infoFetcher";

export const initializeScript = (): void => {
    //打印初始log信息
    logger.info('WebGAL 3.9.7');
    logger.info('Github: https://github.com/MakinoharaShoko/WebGAL ');
    logger.info('Made with ❤ by MakinoharaShoko');
    infoFetcher('./game/config.txt');

}