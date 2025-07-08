import { assetSetter } from '@/Core/util/gameAssetsAccess/assetSetter';
import { assetsPrefetcher } from '@/Core/util/prefetcher/assetsPrefetcher';
import SceneParser from 'webgal-parser';
import { commandType, IScene } from '../controller/scene/sceneInterface';
import { logger } from '../util/logger';
import { bgm } from '@/Core/gameScripts/bgm';
import { callSceneScript } from '@/Core/gameScripts/callSceneScript';
import { changeBg } from '@/Core/gameScripts/changeBg';
import { changeFigure } from '@/Core/gameScripts/changeFigure';
import { changeSceneScript } from '@/Core/gameScripts/changeSceneScript';
import { choose } from '@/Core/gameScripts/choose';
import { comment } from '@/Core/gameScripts/comment';
import { filmMode } from '@/Core/gameScripts/filmMode';
import { getUserInput } from '@/Core/gameScripts/getUserInput';
import { intro } from '@/Core/gameScripts/intro';
import { label } from '@/Core/gameScripts/label';
import { miniAvatar } from '@/Core/gameScripts/miniAvatar';
import { pixi } from '@/Core/gameScripts/pixi';
import { playEffect } from '@/Core/gameScripts/playEffect';
import { playVideo } from '@/Core/gameScripts/playVideo';
import { setAnimation } from '@/Core/gameScripts/setAnimation';
import { setComplexAnimation } from '@/Core/gameScripts/setComplexAnimation';
import { setFilter } from '@/Core/gameScripts/setFilter';
import { setTempAnimation } from '@/Core/gameScripts/setTempAnimation';
import { setTextbox } from '@/Core/gameScripts/setTextbox';
import { setTransform } from '@/Core/gameScripts/setTransform';
import { setTransition } from '@/Core/gameScripts/setTransition';
import { unlockBgm } from '@/Core/gameScripts/unlockBgm';
import { unlockCg } from '@/Core/gameScripts/unlockCg';
import { end } from '../gameScripts/end';
import { jumpLabel } from '../gameScripts/jumpLabel';
import { pixiInit } from '../gameScripts/pixi/pixiInit';
import { say } from '../gameScripts/say';
import { setVar } from '../gameScripts/setVar';
import { showVars } from '../gameScripts/showVars';
import { defineScripts, IConfigInterface, ScriptConfig, ScriptFunction, scriptRegistry } from './utils';
import { applyStyle } from '@/Core/gameScripts/applyStyle';
import { wait } from '@/Core/gameScripts/wait';

export const SCRIPT_TAG_MAP = defineScripts({
  say: ScriptConfig(commandType.say, say),
  changeBg: ScriptConfig(commandType.changeBg, changeBg),
  changeFigure: ScriptConfig(commandType.changeFigure, changeFigure),
  bgm: ScriptConfig(commandType.bgm, bgm, { next: true }),
  playVideo: ScriptConfig(commandType.video, playVideo),
  pixiPerform: ScriptConfig(commandType.pixi, pixi, { next: true }),
  pixiInit: ScriptConfig(commandType.pixiInit, pixiInit, { next: true }),
  intro: ScriptConfig(commandType.intro, intro),
  miniAvatar: ScriptConfig(commandType.miniAvatar, miniAvatar, { next: true }),
  changeScene: ScriptConfig(commandType.changeScene, changeSceneScript),
  choose: ScriptConfig(commandType.choose, choose),
  end: ScriptConfig(commandType.end, end),
  setComplexAnimation: ScriptConfig(commandType.setComplexAnimation, setComplexAnimation),
  setFilter: ScriptConfig(commandType.setFilter, setFilter),
  label: ScriptConfig(commandType.label, label, { next: true }),
  jumpLabel: ScriptConfig(commandType.jumpLabel, jumpLabel),
  // chooseLabel: ScriptConfig(commandType.chooseLabel, undefined),
  setVar: ScriptConfig(commandType.setVar, setVar, { next: true }),
  // if: ScriptConfig(commandType.if, undefined, { next: true }),
  callScene: ScriptConfig(commandType.callScene, callSceneScript),
  showVars: ScriptConfig(commandType.showVars, showVars),
  unlockCg: ScriptConfig(commandType.unlockCg, unlockCg, { next: true }),
  unlockBgm: ScriptConfig(commandType.unlockBgm, unlockBgm, { next: true }),
  filmMode: ScriptConfig(commandType.filmMode, filmMode, { next: true }),
  setTextbox: ScriptConfig(commandType.setTextbox, setTextbox),
  setAnimation: ScriptConfig(commandType.setAnimation, setAnimation),
  playEffect: ScriptConfig(commandType.playEffect, playEffect, { next: true }),
  setTempAnimation: ScriptConfig(commandType.setTempAnimation, setTempAnimation),
  __commment: ScriptConfig(commandType.comment, comment, { next: true }),
  setTransform: ScriptConfig(commandType.setTransform, setTransform),
  setTransition: ScriptConfig(commandType.setTransition, setTransition, { next: true }),
  getUserInput: ScriptConfig(commandType.getUserInput, getUserInput),
  applyStyle: ScriptConfig(commandType.applyStyle, applyStyle, { next: true }),
  wait: ScriptConfig(commandType.wait, wait),
});

export const SCRIPT_CONFIG: IConfigInterface[] = Object.values(SCRIPT_TAG_MAP);

export const ADD_NEXT_ARG_LIST = SCRIPT_CONFIG.filter((config) => config.next).map((config) => config.scriptType);

/**
 * 场景解析器
 * @param rawScene 原始场景
 * @param sceneName 场景名称
 * @param sceneUrl 场景url
 * @return {IScene} 解析后的场景
 */
export const WebgalParser = new SceneParser(assetsPrefetcher, assetSetter, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

export const sceneParser = (rawScene: string, sceneName: string, sceneUrl: string): IScene => {
  const parsedScene = WebgalParser.parse(rawScene, sceneName, sceneUrl);
  logger.info(`解析场景：${sceneName}，数据为：`, parsedScene);
  return parsedScene;
};

export { scriptRegistry, type ScriptFunction };
