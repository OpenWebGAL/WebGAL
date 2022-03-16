import axios from "axios";
import {logger} from "../util/logger";
import {assetSetter, fileType} from "../util/assetSetter";
import {storeGlobal} from "../store/storeRef";

export const infoFetcher = (url: string) => {
    axios.get(url).then(r => {
        let gameConfigRaw: Array<string> = r.data.split('\n');
        gameConfigRaw = gameConfigRaw.map(e => e.split(';')[0]);
        const gameConfig: Array<Array<string>> = gameConfigRaw.map(e => e.split(':'));
        logger.info('获取到游戏信息', gameConfig);
        //按照游戏的配置开始设置对应的状态
        gameConfig.forEach(e => {
            if (e[0] === 'Title_img') {
                const url: string = assetSetter(e[1], fileType.background);
                storeGlobal.GUI.current.setVisibility('showTitle', false);
            }
        })
    })
}