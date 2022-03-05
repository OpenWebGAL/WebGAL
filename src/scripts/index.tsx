import fetchScene from "@/plugins/axios";
import type { GameInfo as GalGameInfo } from "@/store/gameInfo";
import axios from "axios";
import { exit, getUrl, prefetcher } from "../utils";
import logger from "../utils/logger";

// const handleList=
export { autoList, manualList, chooseList, varList } from './scriptsMap'
export { compatibilityList, setCompatibility } from './compatibility'

export const GameInfo = {
    Game_name: 'WebGAL Demo',
    Game_key: 'WG_default',
    Title_img: 'Title.png',
    Title_bgm: '夏影.mp3',
    Loading_img: 'none'
}
/**
 * @description: 获取游戏主信息
 * @param {*}
 * @return {*}
 */
export const getGameInfo = async (gameInfo: GalGameInfo) => {
    logger.info('WebGAL 3.9.3');
    logger.info('Github: https://github.com/MakinoharaShoko/WebGAL ');
    logger.info('Made with ❤ by MakinoharaShoko')
    const { data } = await axios.get('game/config.txt')
    let textList: string[] = data.split('\n');
    for (let i = 0; i < textList.length; i++) {
        let tempStr = textList[i].split(";")[0];
        let temp = tempStr.split(':');
        if (!exit(temp[0])) continue;
        if (gameInfo.hasOwnProperty(temp[0])) {
            gameInfo[temp[0] as keyof typeof gameInfo] = temp[1];
        } else {
            logger.warn(`\'${temp[0]}\' key in gameInfo is not exist.`, gameInfo);
        }
    }
    document.title = gameInfo['Game_name'];
    return { ...gameInfo }
}

/**
 * @description:从头开始游戏
 * @param {*}
 * @return {*}
 */
export const startGame = async (url: string = 'start.txt') => {
    const currentScene = await getScene(getUrl(url, 'scene'))
    return {
        url,
        currentScene
    }
}


/**
 * @description: 获取场景
 * @param {string} url 场景路径
 * @return {*}
 */
export const getScene = async (url: string) => {
    logger.info('开始获取场景脚本')
    try {
        const currentScene = await fetchScene(url) as [string, string][]
        logger.info('读取脚本完成', currentScene);
        // 场景级预加载
        prefetcher.onSceneChange(url);
        return currentScene
    } catch (e) {
        throw e
    }
}
