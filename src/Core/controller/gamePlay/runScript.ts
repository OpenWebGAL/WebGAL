import {commandType, ISentence} from '../../interface/coreInterface/sceneInterface';
import {say} from './scripts/say';
import {initPerform, IPerform} from '../../interface/coreInterface/performInterface';
import {unmountPerform} from '../perform/unmountPerform';
import {runtime_gamePlay} from '../../runtime/gamePlay';
import {changeBg} from './scripts/changeBg';
import {changeFigure} from './scripts/changeFigure';
import {bgm} from './scripts/bgm';
import {callSceneScript} from './scripts/callSceneScript';
import {changeSceneScript} from './scripts/changeSceneScript';
import {intro} from './scripts/intro';
import {pixi} from "@/Core/controller/gamePlay/scripts/pixi";
import {miniAvatar} from "@/Core/controller/gamePlay/scripts/miniAvatar";
import {pixiInit} from "@/Core/controller/gamePlay/scripts/pixiInit";
import {logger} from "@/Core/util/logger";
import {playVideo} from "@/Core/controller/gamePlay/scripts/playVideo";
import {jumpLabel} from "@/Core/controller/gamePlay/scripts/jumpLabel";
import {label} from "@/Core/controller/gamePlay/scripts/label";
import {choose} from "@/Core/controller/gamePlay/scripts/choose";
import {end} from "@/Core/controller/gamePlay/scripts/end";
import {setBgFilter} from "@/Core/controller/gamePlay/scripts/setBgFilter";
import {setBgAni} from "@/Core/controller/gamePlay/scripts/setBgAni";
import {setFigAni} from "@/Core/controller/gamePlay/scripts/setFigAni";
import {setBgTransform} from "@/Core/controller/gamePlay/scripts/setBgTransform";
import {webgalStore} from "@/Core/store/store";
import _ from 'lodash';
import { resetStageState } from '@/Core/store/stageReducer';

/**
 * 规范函数的类型
 * @type {(sentence: ISentence) => IPerform}
 */
type scriptFunction = (sentence: ISentence) => IPerform

/**
 * 语句调用器，真正执行语句的调用，并自动将演出在指定时间卸载
 * @param script 调用的语句
 */
export const runScript = (script: ISentence) => {
    let perform: IPerform = initPerform;
    let funcToRun: scriptFunction = say; // 默认是say

    // 建立语句类型到执行函数的映射
    const scriptToFuncMap = new Map([
        [commandType.say, say],
        [commandType.changeBg, changeBg],
        [commandType.changeFigure, changeFigure],
        [commandType.bgm, bgm],
        [commandType.callScene, callSceneScript],
        [commandType.changeScene, changeSceneScript],
        [commandType.intro, intro],
        [commandType.pixi, pixi],
        [commandType.miniAvatar, miniAvatar],
        [commandType.pixiInit, pixiInit],
        [commandType.video, playVideo],
        [commandType.jumpLabel, jumpLabel],
        [commandType.label, label],
        [commandType.choose, choose],
        [commandType.end, end],
        [commandType.setBgFilter, setBgFilter],
        [commandType.perform_bgAni, setBgAni],
        [commandType.perform_FigAni, setFigAni],
        [commandType.setBgTransform, setBgTransform],
    ]);

    // 根据脚本类型切换函数
    if (scriptToFuncMap.has(script.command)) {
        funcToRun = scriptToFuncMap.get(script.command) as scriptFunction;
    }

    // 调用脚本对应的函数
    perform = funcToRun(script);

    // 语句不执行演出
    if (perform.performName === 'none') {
        logger.warn('本条语句不执行演出');
        return;
    }

    // 同步演出状态
    const stageState = webgalStore.getState().stage;
    const newStageState = _.cloneDeep(stageState);
    newStageState.PerformList.push({isHoldOn: perform.isHoldOn, script: script});
    webgalStore.dispatch(resetStageState(newStageState));

    // 时间到后自动清理演出
    perform.stopTimeout = setTimeout(() => {
        // perform.stopFunction();
        perform.isOver = true;
        if (!perform.isHoldOn) {
            // 如果不是保持演出，清除
            unmountPerform(perform.performName);
        }
    }, perform.duration);

    runtime_gamePlay.performList.push(perform);
};
