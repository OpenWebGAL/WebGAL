import { IEffect, IStageState } from '@/store/stageInterface';
import { useEffect } from 'react';
import { logger } from '@/Core/util/logger';
import { generateUniversalSoftInAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftIn';
import { IStageObject } from '@/Core/controller/stage/pixi/PixiController';
import { generateUniversalSoftOffAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftOff';

import {
  addOrRemoveStageObject,
  getOldTargetSuffix,
  removeStageObjectWithAnimationByKey,
} from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';
import { STAGE_KEYS } from '@/Core/constants';

export function useSetFigure(stageState: IStageState) {
  const {
    figNameLeft,
    figName,
    figNameRight,
    freeFigure,
    live2dMotion,
    live2dExpression,
    live2dBlink,
    live2dFocus,
    figureMetaData,
  } = stageState;

  /**
   * 同步 motion
   */
  useEffect(() => {
    for (const motion of live2dMotion) {
      WebGAL.gameplay.pixiStage?.changeModelMotionByKey(motion.target, motion.motion);
    }
  }, [live2dMotion]);

  /**
   * 同步 expression
   */
  useEffect(() => {
    for (const expression of live2dExpression) {
      WebGAL.gameplay.pixiStage?.changeModelExpressionByKey(expression.target, expression.expression);
    }
  }, [live2dExpression]);

  /**
   * 同步 blink
   */
  useEffect(() => {
    for (const blink of live2dBlink) {
      WebGAL.gameplay.pixiStage?.changeModelBlinkByKey(blink.target, blink.blink);
    }
  }, [live2dBlink]);

  /**
   * 同步 focus
   */
  useEffect(() => {
    for (const focus of live2dFocus) {
      WebGAL.gameplay.pixiStage?.changeModelFocusByKey(focus.target, focus.focus);
    }
  }, [live2dFocus]);

  /**
   * 同步元数据
   */
  useEffect(() => {
    Object.entries(figureMetaData).forEach(([key, value]) => {
      const figureObject = WebGAL.gameplay.pixiStage?.getStageObjByKey(key);
      if (figureObject && !figureObject.isExiting && value?.zIndex !== undefined && figureObject.pixiContainer) {
        figureObject.pixiContainer.zIndex = value.zIndex;
      }
    });
  }, [figureMetaData]);

  /**
   * 设置立绘
   */
  useEffect(() => {
    /**
     * 特殊处理：中间立绘
     */
    const thisFigKey = STAGE_KEYS.FIG_CENTER;
    addOrRemoveStageObject(thisFigKey, figName, stageState.effects, () => {
      addFigure(undefined, thisFigKey, figName, 'center');
    });
  }, [figName]);

  useEffect(() => {
    /**
     * 特殊处理：左侧立绘
     */
    const thisFigKey = STAGE_KEYS.FIG_LEFT;
    addOrRemoveStageObject(thisFigKey, figNameLeft, stageState.effects, () => {
      addFigure(undefined, thisFigKey, figNameLeft, 'left');
    });
  }, [figNameLeft]);

  useEffect(() => {
    /**
     * 特殊处理：右侧立绘
     */
    const thisFigKey = STAGE_KEYS.FIG_RIGHT;
    addOrRemoveStageObject(thisFigKey, figNameRight, stageState.effects, () => {
      addFigure(undefined, thisFigKey, figNameRight, 'right');
    });
  }, [figNameRight]);

  useEffect(() => {
    // 自由立绘
    for (const fig of freeFigure) {
      /**
       * 特殊处理：自由立绘
       */
      const thisFigKey = `${fig.key}`;
      addOrRemoveStageObject(thisFigKey, fig.name, stageState.effects, () => {
        addFigure(undefined, thisFigKey, fig.name, fig.basePosition);
      });
    }

    /**
     * 移除不在状态表中的立绘
     */
    const currentFigures = WebGAL.gameplay.pixiStage?.getFigureObjects();
    if (currentFigures) {
      for (const existFigure of currentFigures) {
        if (
          existFigure.key === STAGE_KEYS.FIG_LEFT ||
          existFigure.key === STAGE_KEYS.FIG_CENTER ||
          existFigure.key === STAGE_KEYS.FIG_RIGHT ||
          existFigure.key.endsWith(getOldTargetSuffix())
        ) {
          // 什么也不做
        } else {
          const existKey = existFigure.key;
          const existFigInState = freeFigure.findIndex((fig) => fig.key === existKey);
          if (existFigInState < 0) {
            removeStageObjectWithAnimationByKey(existKey, stageState.effects);
          }
        }
      }
    }
  }, [freeFigure]);
}

function addFigure(type?: 'image' | 'live2D' | 'spine', ...args: any[]) {
  const url = args[1];
  const baseUrl = window.location.origin;
  const urlObject = new URL(url, baseUrl);
  const _type = urlObject.searchParams.get('type') as 'image' | 'live2D' | 'spine' | null;
  if (url.endsWith('.json')) {
    return addLive2dFigure(...args);
  } else if (url.endsWith('.skel') || _type === 'spine') {
    // @ts-ignore
    return WebGAL.gameplay.pixiStage?.addSpineFigure(...args);
  } else {
    // @ts-ignore
    return WebGAL.gameplay.pixiStage?.addFigure(...args);
  }
}

/**
 * 如果要使用 Live2D，取消这里的注释
 * @param args
 */
function addLive2dFigure(...args: any[]) {
  // @ts-ignore
  return WebGAL.gameplay.pixiStage?.addLive2dFigure(...args);
}
