import {commandType, ISentence} from "../../interface/scene";
import {say} from "./scripts/say";
import {initPerform, IPerform} from "../../interface/perform";
import {unmountPerform} from "../perform/unmountPerform";
import {getRef} from "../../store/storeRef";
import {runtime_gamePlay} from "../../runtime/gamePlay";
import {changeBg} from "./scripts/changeBg";

/**
 * 规范函数的类型
 * @type {(sentence: ISentence) => IPerform}
 */
type scriptFunction = (sentence: ISentence) => IPerform;

/**
 * 语句调用器，真正执行语句的调用，并自动将演出在指定时间卸载
 * @param script 调用的语句
 */
export const runScript = (script: ISentence) => {
    let perform: IPerform = initPerform;
    let funcToRun: scriptFunction = say; //默认是say

    //根据脚本类型切换函数
    switch (script.command) {
        case commandType.say:
            funcToRun = say;
            break;
        case commandType.changeBg:
            funcToRun = changeBg;
            break;
    }

    //调用脚本对应的函数
    perform = funcToRun(script);

    //同步演出状态
    const stageStore: any = getRef('stageRef');
    stageStore.stageState.PerformList.push({isHoldOn: perform.isHoldOn, script: script});

    //时间到后自动清理演出
    perform.stopTimeout = setTimeout(() => {
        perform.stopFunction();
        if (!perform.isHoldOn) //如果不是保持演出，清除
            unmountPerform(perform.performName);
    }, perform.duration);

    runtime_gamePlay.performList.push(perform);
}