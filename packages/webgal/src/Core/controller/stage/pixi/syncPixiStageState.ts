import { baseTransform } from '@/Core/Modules/stage/stageInterface';
import type { IEffect, IStageState, ITransform } from '@/Core/Modules/stage/stageInterface';
import type { IResolvedStageCommitOptions } from '@/Core/Modules/stage/stageStateManager';
import { DEFAULT_BG_OUT_DURATION } from '@/Core/constants';
import { WebGAL } from '@/Core/WebGAL';
import PixiStage from '@/Core/controller/stage/pixi/PixiController';
import type { IStageObject } from '@/Core/controller/stage/pixi/PixiController';
import { getEnterExitAnimation } from '@/Core/Modules/animationFunctions';
import { logger } from '@/Core/util/logger';
import { setEbg } from '@/Core/gameScripts/changeBg/setEbg';
import { isUndefined, omitBy } from 'lodash';

export function syncPixiStageState(stageState: IStageState, options: IResolvedStageCommitOptions) {
  if (options.syncPixiStage) {
    syncBg(stageState);
    syncFigures(stageState);
    syncLive2d(stageState);
    syncFigureMetaData(stageState);
  }
  if (options.applyPixiEffects) {
    applyStageEffects(stageState.effects);
  }
}

export function applyStageEffects(effects: IEffect[]) {
  const pixiStage = WebGAL.gameplay.pixiStage;
  if (!pixiStage) return;
  const stageObjects = pixiStage.getAllStageObj();
  const lockedStageTargets = pixiStage.getAllLockedObject();
  for (const stageObj of stageObjects) {
    const key = stageObj.key;
    if (lockedStageTargets.includes(key)) continue;
    const effect = effects.find((effect) => effect.target === key);
    const targetPixiContainer = pixiStage.getStageObjByKey(key);
    const container = targetPixiContainer?.pixiContainer;
    if (!container) continue;
    // @ts-ignore WebGALPixiContainer exposes transform-like fields.
    PixiStage.assignTransform(container, convertTransform(effect?.transform ?? baseTransform));
  }
}

function syncBg(stageState: IStageState) {
  const pixiStage = WebGAL.gameplay.pixiStage;
  if (!pixiStage) return;
  const thisBgKey = 'bg-main';
  const bgName = stageState.bgName;
  const currentBg = pixiStage.getStageObjByKey(thisBgKey);

  if (bgName !== '') {
    if (currentBg?.sourceUrl === bgName) return;
    if (currentBg) {
      removeBg(currentBg);
    }
    addBg(thisBgKey, bgName);
    logger.debug('重设背景');
    const { duration, animation } = getEnterExitAnimation(thisBgKey, 'enter', true);
    if (WebGAL.gameplay.isFast) {
      setEbg(bgName, 0);
    } else {
      setEbg(bgName, duration);
      pixiStage.registerPresetAnimation(animation, 'bg-main-softin', thisBgKey, stageState.effects);
      setTimeout(() => pixiStage.removeAnimationWithSetEffects('bg-main-softin'), duration);
    }
    return;
  }

  if (!currentBg) return;
  const exitDuration = removeBg(currentBg);
  setEbg(bgName, exitDuration, 'cubic-bezier(0.5, 0, 0.75, 0)');
}

function syncFigures(stageState: IStageState) {
  syncFigureSlot('fig-center', stageState.figName, 'center', stageState);
  syncFigureSlot('fig-left', stageState.figNameLeft, 'left', stageState);
  syncFigureSlot('fig-right', stageState.figNameRight, 'right', stageState);

  for (const fig of stageState.freeFigure) {
    syncFigureSlot(fig.key, fig.name, fig.basePosition, stageState);
  }

  const currentFigures = WebGAL.gameplay.pixiStage?.getFigureObjects();
  if (!currentFigures) return;
  const freeFigureKeys = new Set(stageState.freeFigure.map((fig) => fig.key));
  for (const existFigure of [...currentFigures]) {
    if (
      existFigure.key === 'fig-left' ||
      existFigure.key === 'fig-center' ||
      existFigure.key === 'fig-right' ||
      existFigure.key.endsWith('-off')
    ) {
      continue;
    }
    if (!freeFigureKeys.has(existFigure.key)) {
      removeFig(existFigure, `${existFigure.key}-softin`, stageState.effects);
    }
  }
}

function syncFigureSlot(key: string, sourceUrl: string, position: 'left' | 'center' | 'right', stageState: IStageState) {
  const pixiStage = WebGAL.gameplay.pixiStage;
  if (!pixiStage) return;
  const softInAniKey = `${key}-softin`;
  const currentFigure = pixiStage.getStageObjByKey(key);

  if (sourceUrl !== '') {
    if (currentFigure?.sourceUrl === sourceUrl) return;
    if (currentFigure) {
      removeFig(currentFigure, softInAniKey, stageState.effects);
    }
    addFigure(key, sourceUrl, position);
    logger.debug(`${key} 立绘已重设`);
    const { duration, animation } = getEnterExitAnimation(key, 'enter');
    if (!WebGAL.gameplay.isFast) {
      pixiStage.registerPresetAnimation(animation, softInAniKey, key, stageState.effects);
      setTimeout(() => pixiStage.removeAnimationWithSetEffects(softInAniKey), duration);
    }
    return;
  }

  if (currentFigure) {
    removeFig(currentFigure, softInAniKey, stageState.effects);
  }
}

function syncLive2d(stageState: IStageState) {
  const pixiStage = WebGAL.gameplay.pixiStage;
  if (!pixiStage) return;
  for (const motion of stageState.live2dMotion) {
    if (motion.skin) {
      pixiStage.changeSpineSkinByKey(motion.target, motion.skin);
    }
    pixiStage.changeModelMotionByKey(motion.target, motion.motion);
  }
  for (const expression of stageState.live2dExpression) {
    pixiStage.changeModelExpressionByKey(expression.target, expression.expression);
  }
  for (const blink of stageState.live2dBlink) {
    pixiStage.changeModelBlinkByKey(blink.target, blink.blink);
  }
  for (const focus of stageState.live2dFocus) {
    pixiStage.changeModelFocusByKey(focus.target, focus.focus);
  }
}

function syncFigureMetaData(stageState: IStageState) {
  const pixiStage = WebGAL.gameplay.pixiStage;
  if (!pixiStage) return;
  Object.entries(stageState.figureMetaData).forEach(([key, value]) => {
    const figureObject = pixiStage.getStageObjByKey(key);
    if (figureObject && !figureObject.isExiting && figureObject.pixiContainer) {
      if (value.zIndex !== undefined) {
        figureObject.pixiContainer.zIndex = value.zIndex;
      }
      if (value.blendMode !== undefined) {
        figureObject.pixiContainer.blendMode = value.blendMode;
      }
    }
  });
}

function removeBg(bgObject: IStageObject): number {
  const pixiStage = WebGAL.gameplay.pixiStage;
  if (!pixiStage) return DEFAULT_BG_OUT_DURATION;
  pixiStage.removeAnimationWithSetEffects('bg-main-softin');
  if (WebGAL.gameplay.isFast) {
    pixiStage.removeStageObjectByKey(bgObject.key);
    return 0;
  }
  const oldBgKey = bgObject.key;
  bgObject.key = 'bg-main-off' + String(new Date().getTime());
  const bgKey = bgObject.key;
  const bgAniKey = bgObject.key + '-softoff';
  pixiStage.removeStageObjectByKey(oldBgKey);
  const { duration, animation } = getEnterExitAnimation('bg-main-off', 'exit', true, bgKey);
  pixiStage.registerAnimation(animation, bgAniKey, bgKey);
  setTimeout(() => {
    pixiStage.removeAnimation(bgAniKey);
    pixiStage.removeStageObjectByKey(bgKey);
  }, duration);
  return duration;
}

function removeFig(figObj: IStageObject, enterTikerKey: string, effects: IEffect[]) {
  const pixiStage = WebGAL.gameplay.pixiStage;
  if (!pixiStage) return;
  pixiStage.removeAnimationWithSetEffects(enterTikerKey);
  if (WebGAL.gameplay.isFast) {
    logger.debug('快速模式，立刻关闭立绘');
    pixiStage.removeStageObjectByKey(figObj.key);
    return;
  }
  const oldFigKey = figObj.key;
  const figLeaveAniKey = oldFigKey + '-off';
  figObj.key = oldFigKey + String(new Date().getTime()) + '-off';
  const figKey = figObj.key;
  pixiStage.removeStageObjectByKey(oldFigKey);
  const leaveKey = figKey + '-softoff';
  const { duration, animation } = getEnterExitAnimation(figLeaveAniKey, 'exit', false, figKey);
  pixiStage.registerPresetAnimation(animation, leaveKey, figKey, effects);
  setTimeout(() => {
    pixiStage.removeAnimation(leaveKey);
    pixiStage.removeStageObjectByKey(figKey);
  }, duration);
}

function addBg(key: string, url: string) {
  const pixiStage = WebGAL.gameplay.pixiStage;
  if (!pixiStage) return;
  if (['mp4', 'webm', 'mkv'].some((e) => url.toLocaleLowerCase().endsWith(e))) {
    pixiStage.addVideoBg(key, url);
  } else if (url.toLocaleLowerCase().endsWith('.skel')) {
    pixiStage.addSpineBg(key, url);
  } else {
    pixiStage.addBg(key, url);
  }
}

function addFigure(key: string, url: string, position: 'left' | 'center' | 'right') {
  const pixiStage = WebGAL.gameplay.pixiStage;
  if (!pixiStage) return;
  const baseUrl = window.location.origin;
  const urlObject = new URL(url, baseUrl);
  const figureType = urlObject.searchParams.get('type') as 'image' | 'live2D' | 'spine' | null;
  if (url.endsWith('.json')) {
    pixiStage.addLive2dFigure(key, url, position);
  } else if (url.endsWith('.skel') || figureType === 'spine') {
    pixiStage.addSpineFigure(key, url, position);
  } else {
    pixiStage.addFigure(key, url, position);
  }
}

function convertTransform(transform: ITransform | undefined) {
  if (!transform) {
    return {};
  }
  const { position, ...rest } = transform;
  return omitBy({ ...rest, x: position?.x, y: position?.y }, isUndefined);
}
