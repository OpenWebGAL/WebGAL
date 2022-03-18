import axios from "axios";
import {logger} from "../util/logger";
import {assetSetter, fileType} from "../util/assetSetter";
import {storeRef} from "../store/storeRef";

/**
 * 获取游戏信息
 * @param url 游戏信息路径
 */
export const infoFetcher = (url: string) => {
    axios.get(url).then(r => {
        let gameConfigRaw: Array<string> = r.data.split('\n'); //游戏配置原始数据
        gameConfigRaw = gameConfigRaw.map(e => e.split(';')[0]);
        const gameConfig: Array<Array<string>> = gameConfigRaw.map(e => e.split(':'));//游戏配置数据
        logger.info('获取到游戏信息', gameConfig);
        //按照游戏的配置开始设置对应的状态
        if (storeRef.GuiRef) {
            // GuiState 是对GUI状态存储的引用。
            const GuiState: any = storeRef.GuiRef.current;
            gameConfig.forEach(e => {
                //设置标题背景
                if (e[0] === 'Title_img') {
                    const url: string = assetSetter(e[1], fileType.background);
                    GuiState.setGuiAsset('titleBg', url);
                }
                //设置标题背景音乐
                if (e[0] === 'Title_bgm') {
                    const url: string = assetSetter(e[1], fileType.background);
                    GuiState.setGuiAsset('titleBgm', url);
                }
            })
        }
    })
}