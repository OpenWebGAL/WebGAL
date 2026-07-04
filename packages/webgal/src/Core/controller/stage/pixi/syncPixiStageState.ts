import type { IEffect, IStageState, ITransform } from '@/Core/Modules/stage/stageInterface';
import type { IResolvedStageCommitOptions } from '@/Core/Modules/stage/stageStateManager';
import { DEFAULT_BG_OUT_DURATION } from '@/Core/constants';
import { WebGAL } from '@/Core/WebGAL';
import type { IStageObject } from '@/Core/controller/stage/pixi/PixiController';
import { getEnterExitAnimation } from '@/Core/Modules/animationFunctions';
import { logger } from '@/Core/util/logger';
import { setEbg } from '@/Core/gameScripts/changeBg/setEbg';
import { applyTransformToPixiContainer } from '@/Core/controller/stage/pixi/stageEffectTransform';

interface ISyncFigureSlotPayload {
  key: string;
  sourceUrl: string;
  position: 'left' | 'center' | 'right';
  stageState: IStageState;
  skipAnimation: boolean;
}

interface IRemoveFigOptions {
  effects: IEffect[];
  skipAnimation: boolean;
}

export function syncPixiStageState(stageState: IStageState, options: IResolvedStageCommitOptions) {
  if (options.syncPixiStage) {
    syncBg(stageState, options.skipAnimation);
    syncFigures(stageState, options.skipAnimation);
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
    const container = stageObj.pixiContainer;
    if (!container) continue;
    applyTransformToPixiContainer(container, effect?.transform);
  }
  pixiStage.requestRender();
}

export function applyStageEffectToTarget(target: string, transform: ITransform | undefined) {
  const pixiStage = WebGAL.gameplay.pixiStage;
  if (!pixiStage) return;
  if (pixiStage.getAllLockedObject().includes(target)) return;

  const container = pixiStage.getStageObjByKey(target)?.pixiContainer;
  if (!container) return;

  applyTransformToPixiContainer(container, transform);
  pixiStage.requestRender();
}

function syncBg(stageState: IStageState, skipAnimation: boolean) {
  const pixiStage = WebGAL.gameplay.pixiStage;
  if (!pixiStage) return;
  const thisBgKey = 'bg-main';
  const bgName = stageState.bgName;
  const currentBg = pixiStage.getStageObjByKey(thisBgKey);

  if (bgName !== '') {
    if (currentBg?.sourceUrl === bgName) return;
    if (currentBg) {
      removeBg(currentBg, skipAnimation);
    }
    addBg(thisBgKey, bgName);
    logger.debug('重设背景');
    const { duration, animation } = getEnterExitAnimation(thisBgKey, 'enter', true);
    if (skipAnimation || WebGAL.gameplay.skipAnimation) {
      setEbg(bgName, 0);
    } else {
      setEbg(bgName, duration);
      pixiStage.registerPresetAnimation(animation, 'bg-main-softin', thisBgKey, stageState.effects);
      setTimeout(() => pixiStage.removeAnimationWithSetEffects('bg-main-softin'), duration);
    }
    return;
  }

  if (!currentBg) return;
  const exitDuration = removeBg(currentBg, skipAnimation);
  setEbg(bgName, exitDuration, 'cubic-bezier(0.5, 0, 0.75, 0)');
}

function syncFigures(stageState: IStageState, skipAnimation: boolean) {
  syncFigureSlot({ key: 'fig-center', sourceUrl: stageState.figName, position: 'center', stageState, skipAnimation });
  syncFigureSlot({ key: 'fig-left', sourceUrl: stageState.figNameLeft, position: 'left', stageState, skipAnimation });
  syncFigureSlot({
    key: 'fig-right',
    sourceUrl: stageState.figNameRight,
    position: 'right',
    stageState,
    skipAnimation,
  });

  for (const fig of stageState.freeFigure) {
    syncFigureSlot({ key: fig.key, sourceUrl: fig.name, position: fig.basePosition, stageState, skipAnimation });
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
      removeFig(existFigure, `${existFigure.key}-softin`, { effects: stageState.effects, skipAnimation });
    }
  }
}

function syncFigureSlot({ key, sourceUrl, position, stageState, skipAnimation }: ISyncFigureSlotPayload) {
  const pixiStage = WebGAL.gameplay.pixiStage;
  if (!pixiStage) return;
  const softInAniKey = `${key}-softin`;
  const currentFigure = pixiStage.getStageObjByKey(key);

  if (sourceUrl !== '') {
    if (currentFigure?.sourceUrl === sourceUrl) return;
    if (currentFigure) {
      removeFig(currentFigure, softInAniKey, { effects: stageState.effects, skipAnimation });
    }
    addFigure(key, sourceUrl, position);
    logger.debug(`${key} 立绘已重设`);
    const { duration, animation } = getEnterExitAnimation(key, 'enter');
    if (!skipAnimation && !WebGAL.gameplay.skipAnimation) {
      pixiStage.registerPresetAnimation(animation, softInAniKey, key, stageState.effects);
      setTimeout(() => pixiStage.removeAnimationWithSetEffects(softInAniKey), duration);
    }
    return;
  }

  if (currentFigure) {
    removeFig(currentFigure, softInAniKey, { effects: stageState.effects, skipAnimation });
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

function removeBg(bgObject: IStageObject, skipAnimation: boolean): number {
  const pixiStage = WebGAL.gameplay.pixiStage;
  if (!pixiStage) return DEFAULT_BG_OUT_DURATION;
  pixiStage.removeAnimationWithSetEffects('bg-main-softin');
  if (skipAnimation || WebGAL.gameplay.skipAnimation) {
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

function removeFig(figObj: IStageObject, enterTikerKey: string, options: IRemoveFigOptions) {
  const pixiStage = WebGAL.gameplay.pixiStage;
  if (!pixiStage) return;
  pixiStage.removeAnimationWithSetEffects(enterTikerKey);
  if (options.skipAnimation || WebGAL.gameplay.skipAnimation) {
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
  pixiStage.registerPresetAnimation(animation, leaveKey, figKey, options.effects);
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
