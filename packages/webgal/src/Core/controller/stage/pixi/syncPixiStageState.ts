import type { IEffect, IFigurePosition, IStageState, ITransform } from '@/Core/Modules/stage/stageInterface';
import {
  FIGURE_KEYS,
  FIGURE_POSITIONS,
  figureStateKeyByPosition,
  normalizeFigureBounds,
} from '@/Core/Modules/stage/stageInterface';
import type { IResolvedStageCommitOptions } from '@/Core/Modules/stage/stageStateManager';
import { DEFAULT_BG_IN_DURATION, DEFAULT_BG_OUT_DURATION, DEFAULT_FIG_IN_DURATION } from '@/Core/constants';
import { WebGAL } from '@/Core/WebGAL';
import type { IStageObject } from '@/Core/controller/stage/pixi/PixiController';
import { getAnimateDuration, getExitAnimation } from '@/Core/Modules/animationFunctions';
import { logger } from '@/Core/util/logger';
import { setEbg } from '@/Core/gameScripts/changeBg/setEbg';
import { applyTransformToPixiContainer } from '@/Core/controller/stage/pixi/stageEffectTransform';

interface ISyncFigureSlotPayload {
  key: string;
  sourceUrl: string;
  position: IFigurePosition;
  /** Live2D 自定义绘制范围，与位置一样只在创建时落地 */
  bounds?: [number, number, number, number];
  skipAnimation: boolean;
}

/**
 * 立绘对象的身份：图片地址、基准位置、Live2D 绘制范围。
 *
 * 这三者都只在创建舞台对象时落地（基准位置写进 setBaseX，绘制范围写进模型的 pivot 与遮罩），
 * 事后没有就地修改的通路。所以身份一变就必须关掉旧立绘再开新的，否则改动会被静默吞掉。
 * 其余参数（zIndex、blendMode、动作、表情、皮肤、眨眼、注视）都有各自的更新通路，不属于身份。
 */
function getFigureIdentity({ sourceUrl, position, bounds }: ISyncFigureSlotPayload): string {
  return JSON.stringify([sourceUrl, position, normalizeFigureBounds(bounds)]);
}

/**
 * 取入场过渡时长。
 *
 * 入场动画本身由 changeBg/changeFigure 作为演出产出，这里只需要时长来同步其他视觉元素。
 */
function getEnterDuration(stageState: IStageState, target: string, isBg: boolean): number {
  const animationSettings = stageState.animationSettings.find((setting) => setting.target === target);
  if (animationSettings?.enterAnimationName) {
    return getAnimateDuration(animationSettings.enterAnimationName);
  }
  return animationSettings?.enterDuration ?? (isBg ? DEFAULT_BG_IN_DURATION : DEFAULT_FIG_IN_DURATION);
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
    const isSkipAnimation = skipAnimation || WebGAL.gameplay.skipAnimation;
    setEbg(bgName, isSkipAnimation ? 0 : getEnterDuration(stageState, thisBgKey, true));
    return;
  }

  if (!currentBg) return;
  const exitDuration = removeBg(currentBg, skipAnimation);
  setEbg(bgName, exitDuration, 'cubic-bezier(0.5, 0, 0.75, 0)');
}

function syncFigures(stageState: IStageState, skipAnimation: boolean) {
  const getBounds = (key: string) => stageState.live2dMotion.find((motion) => motion.target === key)?.overrideBounds;

  for (const position of FIGURE_POSITIONS) {
    const key = `fig-${position}`;
    syncFigureSlot({
      key,
      sourceUrl: stageState[figureStateKeyByPosition[position]],
      position,
      bounds: getBounds(key),
      skipAnimation,
    });
  }

  for (const fig of stageState.freeFigure) {
    syncFigureSlot({
      key: fig.key,
      sourceUrl: fig.name,
      position: fig.basePosition,
      bounds: getBounds(fig.key),
      skipAnimation,
    });
  }

  const currentFigures = WebGAL.gameplay.pixiStage?.getFigureObjects();
  if (!currentFigures) return;
  const freeFigureKeys = new Set(stageState.freeFigure.map((fig) => fig.key));
  for (const existFigure of [...currentFigures]) {
    if (FIGURE_KEYS.includes(existFigure.key) || existFigure.key.endsWith('-off')) {
      continue;
    }
    if (!freeFigureKeys.has(existFigure.key)) {
      removeFig(existFigure, `${existFigure.key}-softin`, skipAnimation);
    }
  }
}

function syncFigureSlot(payload: ISyncFigureSlotPayload) {
  const { key, sourceUrl, position, skipAnimation } = payload;
  const pixiStage = WebGAL.gameplay.pixiStage;
  if (!pixiStage) return;
  const softInAniKey = `${key}-softin`;
  const currentFigure = pixiStage.getStageObjByKey(key);

  // 旧存档中可能没有新增位置的字段，这里同时容错 undefined
  if (sourceUrl) {
    const identity = getFigureIdentity(payload);
    if (currentFigure?.figureIdentity === identity) return;
    if (currentFigure) {
      removeFig(currentFigure, softInAniKey, skipAnimation);
    }
    // 入场动画由 changeFigure 作为演出产出，这里只负责创建舞台对象
    addFigure(key, sourceUrl, position);
    // 舞台对象是同步入表的，这里记下它是按哪份身份创建的，供下次同步比对
    const newFigure = pixiStage.getStageObjByKey(key);
    if (newFigure) {
      newFigure.figureIdentity = identity;
    }
    logger.debug(`${key} 立绘已重设`);
    return;
  }

  if (currentFigure) {
    removeFig(currentFigure, softInAniKey, skipAnimation);
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
  pixiStage.removeAnimation('bg-main-softin');
  if (skipAnimation || WebGAL.gameplay.skipAnimation) {
    pixiStage.removeStageObjectByKey(bgObject.key);
    return 0;
  }
  const oldBgKey = bgObject.key;
  bgObject.key = 'bg-main-off' + String(new Date().getTime());
  const bgKey = bgObject.key;
  const bgAniKey = bgObject.key + '-softoff';
  pixiStage.removeStageObjectByKey(oldBgKey);
  const { duration, animation } = getExitAnimation('bg-main-off', true, bgKey);
  pixiStage.registerAnimation(animation, bgAniKey, bgKey);
  setTimeout(() => {
    pixiStage.removeAnimation(bgAniKey);
    pixiStage.removeStageObjectByKey(bgKey);
  }, duration);
  return duration;
}

function removeFig(figObj: IStageObject, enterTikerKey: string, skipAnimation: boolean) {
  const pixiStage = WebGAL.gameplay.pixiStage;
  if (!pixiStage) return;
  // 只有真正决定让它退场时才打标记，标记与下面的改名同属一步，不会留给复用中的立绘
  figObj.isExiting = true;
  pixiStage.removeAnimation(enterTikerKey);
  if (skipAnimation || WebGAL.gameplay.skipAnimation) {
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
  // 退出对象的 key 带时间戳，永远不在 effects 白名单里，因此与背景一样走普通动画通道即可
  const { duration, animation } = getExitAnimation(figLeaveAniKey, false, figKey);
  pixiStage.registerAnimation(animation, leaveKey, figKey);
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

function addFigure(key: string, url: string, position: IFigurePosition) {
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
