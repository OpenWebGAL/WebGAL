import {ISentence} from '@/Core/interface/coreInterface/sceneInterface';
import {IPerform} from '@/Core/interface/coreInterface/performInterface';
import {runtime_gamePlay} from "@/Core/runtime/gamePlay";
import pixiRain from "../../../../Core/controller/perform/pixi/pixiScripts/rain";
import {pixiSnow} from "@/Core/controller/perform/pixi/pixiScripts/snow";
import {logger} from "@/Core/util/logger";

/**
 * 运行一段pixi演出
 * @param sentence
 */
export const pixi = (sentence: ISentence): IPerform => {
    const pixiPerformName = 'PixiPerform' + sentence.content;
    runtime_gamePlay.performList.forEach(e => {
        if (e.performName === pixiPerformName) {
            return {
                performName: 'none',
                duration: 0,
                isOver: false,
                isHoldOn: true,
                stopFunction: () => {
                },
                blockingNext: () => false,
                blockingAuto: () => false,
                stopTimeout: undefined, // 暂时不用，后面会交给自动清除
            };
        }
    });
    let container: any;
    switch (sentence.content) {
        case 'rain':
            container = pixiRain(6, 10);
            break;
        case 'snow':
            container = pixiSnow(3);
            break;
    }
    return {
        performName: pixiPerformName,
        duration: 0,
        isOver: false,
        isHoldOn: true,
        stopFunction: () => {
            logger.warn('现在正在卸载pixi演出');
            container.destroy({texture: true, baseTexture: true});
        },
        blockingNext: () => false,
        blockingAuto: () => false,
        stopTimeout: undefined, // 暂时不用，后面会交给自动清除
    };
};
