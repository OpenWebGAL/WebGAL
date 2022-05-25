import {commandType, ISentence} from '../../../interface/coreInterface/sceneInterface';
import {say} from '../../gameScripts/say';
import {initPerform, IPerform} from '../../../interface/coreInterface/performInterface';
import {unmountPerform} from '../perform/unmountPerform';
import {runtime_gamePlay} from '../../runtime/gamePlay';
import {changeBg} from '../../gameScripts/changeBg';
import {changeFigure} from '../../gameScripts/changeFigure';
import {bgm} from '../../gameScripts/bgm';
import {callSceneScript} from '../../gameScripts/callSceneScript';
import {changeSceneScript} from '../../gameScripts/changeSceneScript';
import {intro} from '../../gameScripts/intro';
import {pixi} from "@/Core/gameScripts/pixi";
import {miniAvatar} from "@/Core/gameScripts/miniAvatar";
import {pixiInit} from "@/Core/gameScripts/pixiInit";
import {logger} from "@/Core/util/etc/logger";
import {playVideo} from "@/Core/gameScripts/playVideo";
import {jumpLabel} from "@/Core/gameScripts/jumpLabel";
import {label} from "@/Core/gameScripts/label";
import {choose} from "@/Core/gameScripts/choose";
import {end} from "@/Core/gameScripts/end";
import {setBgFilter} from "@/Core/gameScripts/setBgFilter";
import {setBgAni} from "@/Core/gameScripts/setBgAni";
import {setFigAni} from "@/Core/gameScripts/setFigAni";
import {setBgTransform} from "@/Core/gameScripts/setBgTransform";
import {webgalStore} from "@/Core/store/store";
import _ from 'lodash';
import {resetStageState} from '@/Core/store/stageReducer';
import {nextSentence} from "@/Core/controller/gamePlay/nextSentence";
import {setVar} from "@/Core/gameScripts/setVar";
import {showVars} from "@/Core/gameScripts/showVars";
import {unlockCg} from "@/Core/gameScripts/unlockCg";
import {unlockBgm} from "@/Core/gameScripts/unlockBgm";

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
    [commandType.setVar, setVar],
    [commandType.showVars, showVars],
    [commandType.unlockCg, unlockCg],
    [commandType.unlockBgm, unlockBgm]
  ]);

  // 根据脚本类型切换函数
  if (scriptToFuncMap.has(script.command)) {
    funcToRun = scriptToFuncMap.get(script.command) as scriptFunction;
  }

  // 调用脚本对应的函数
  perform = funcToRun(script);

  // 语句不执行演出
  if (perform.performName === 'none') {
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
      if (perform.goNextWhenOver) {
        nextSentence();
      }
    }
  }, perform.duration);

  runtime_gamePlay.performList.push(perform);
};
