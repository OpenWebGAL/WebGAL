/**
 * @file 引擎初始化时会执行的脚本，包括获取游戏信息，初始化运行时变量，初始化用户数据存储
 */

import {logger} from "./util/logger";
import {infoFetcher} from "./util/infoFetcher";
import {resize} from "./util/resize";
import {assetSetter, fileType} from "./util/assetSetter";
import {sceneFetcher} from "./util/sceneFetcher";
import {runtime_currentSceneData} from "./runtime/sceneData";
import {sceneParser} from "./parser/sceneParser";

/**
 * 引擎初始化函数
 */
export const initializeScript = (): void => {
    //打印初始log信息
    logger.info('WebGAL 4.0.1 beta');
    logger.info('Github: https://github.com/MakinoharaShoko/WebGAL ');
    logger.info('Made with ❤ by MakinoharaShoko');
    //激活强制缩放
    //在调整窗口大小时重新计算宽高，设计稿按照 1600*900。
    setTimeout(resize, 100)
    resize();
    window.onresize = resize;
    //监听键盘 F11 事件，全屏时触发页面调整
    document.onkeydown = function (event) {
        const e = event || arguments.callee.caller.arguments[0];
        if (e && e.keyCode == 122) {
            setTimeout(() => {
                resize();
            }, 100);
        }
    };
    //获取游戏信息
    infoFetcher('./game/config.txt');
    //获取start场景
    const sceneUrl: string = assetSetter('start.txt', fileType.scene);
    //场景写入到运行时
    sceneFetcher(sceneUrl).then(rawScene => {
        runtime_currentSceneData.currentScene = sceneParser(rawScene, 'start.txt', sceneUrl);
    })
}