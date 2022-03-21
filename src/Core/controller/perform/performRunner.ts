import {IPerform, IRunPerform} from "../../interface/perform";
import {logger} from "../../util/logger";
import {runtime_gamePlay} from "../../runtime/gamePlay";

/**
 * 启动演出，并将演出控制对象加入runtime
 * @param perform 演出启动对象
 */
const performRunner = (perform: IRunPerform) => {
    const performInitName: string = Math.random().toString();
    const performController: IPerform = {
        performName: performInitName,
        duration: perform.duration,
        isOver: false,
        isHoldOn: false,
        stopFunction: () => {
        },
        blockingNext: () => false,
        blockingAuto: () => true
    }
    //TODO：启动演出，改变performController


    logger.info('演出开始', performController);
    if (!performController.isHoldOn) { //不是一个保持演出，有明确的结束时间
        runtime_gamePlay.timeoutList.push(setTimeout(performController.stopFunction, performController.duration));
    }
    runtime_gamePlay.performList.push(performController);
}