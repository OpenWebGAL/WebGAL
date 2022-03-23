import {commandType, ISentence} from "../../interface/scene";
import {say} from "./scripts/say";
import {IPerform} from "../../interface/perform";
import {unmountPerform} from "../perform/unmountPerform";
import {storeRef} from "../../store/storeRef";
import {runtime_gamePlay} from "../../runtime/gamePlay";

/**
 * 语句调用器，真正执行语句的调用，并自动将演出在指定时间卸载
 * @param script 调用的语句
 */
export const runScript = (script: ISentence) => {
    let perform: IPerform = {
        performName: 'init',
        duration: 100,
        isOver: false,
        isHoldOn: false,
        stopFunction: () => {
        },
        blockingNext: () => false,
        blockingAuto: () => true,
        stopTimeout: undefined
    }
    switch (script.command) {
        case commandType.say:
            perform = say(script);
            break;
    }

    //同步演出状态
    if (storeRef.stageRef) {
        const stageStore: any = storeRef.stageRef.current;
        stageStore.stageState.PerformList.push({isHoldOn: perform.isHoldOn, script: script});
    }

    //时间到后自动清理演出
    if (perform.performName !== 'init') {
        perform.stopTimeout = setTimeout(() => {
            perform.stopFunction();
            if (!perform.isHoldOn) //如果不是保持演出，清除
                unmountPerform(perform.performName);
        }, perform.duration);
    }

    runtime_gamePlay.performList.push(perform);
}