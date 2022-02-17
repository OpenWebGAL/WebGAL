import pixiSnow from "./presets/snow";
import pixiRain2 from "./presets/rain2";
import logger from "../util/logger";

const presetMap = {
    'snow': () => pixiSnow(3),
    'rain': () => pixiRain2(6, 10)
}

const PixiMap = (performType, option) => {
    if (presetMap.hasOwnProperty(performType))
        return presetMap[performType];
    else
        return () => {
            logger.error('特效预设不存在');
        }
}


export {PixiMap};