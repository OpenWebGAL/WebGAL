import { IEffect, IStageState } from '@/store/stageInterface';
import { useEffect } from 'react';
import { logger } from '@/Core/util/logger';
import { generateUniversalSoftInAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftIn';
import { IStageObject } from '@/Core/controller/stage/pixi/PixiController';
import { generateUniversalSoftOffAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftOff';

import { getEnterExitAnimation } from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';

export function useSetFigure(stageState: IStageState) {
  const { figNameLeft, figName, figNameRight, freeFigure, live2dMotion, live2dExpression } = stageState;

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
   * 设置立绘
   */
  useEffect(() => {
    /**
     * 特殊处理：中间立绘
     */
    const thisFigKey = 'fig-center';
    const softInAniKey = 'fig-center-softin';
    if (figName !== '') {
      const currentFigCenter = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigCenter) {
        if (currentFigCenter.sourceUrl !== figName) {
          removeFig(currentFigCenter, softInAniKey, stageState.effects);
        }
      }
      const onLoaded = () => {
        logger.debug('中立绘已重设');
        const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
        WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
        setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects(softInAniKey), duration);
      };
      addFigure(onLoaded, undefined, thisFigKey, figName, 'center');
    } else {
      logger.debug('移除中立绘');
      const currentFigCenter = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigCenter) {
        if (currentFigCenter.sourceUrl !== figName) {
          removeFig(currentFigCenter, softInAniKey, stageState.effects);
        }
      }
    }
  }, [figName]);

  useEffect(() => {
    /**
     * 特殊处理：左侧立绘
     */
    const thisFigKey = 'fig-left';
    const softInAniKey = 'fig-left-softin';
    if (figNameLeft !== '') {
      const currentFigLeft = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigLeft) {
        if (currentFigLeft.sourceUrl !== figNameLeft) {
          removeFig(currentFigLeft, softInAniKey, stageState.effects);
        }
      }
      const onLoaded = () => {
        logger.debug('左立绘已重设');
        const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
        WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
        setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects(softInAniKey), duration);
      };
      addFigure(onLoaded, undefined, thisFigKey, figNameLeft, 'left');
    } else {
      logger.debug('移除左立绘');
      const currentFigLeft = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigLeft) {
        if (currentFigLeft.sourceUrl !== figNameLeft) {
          removeFig(currentFigLeft, softInAniKey, stageState.effects);
        }
      }
    }
  }, [figNameLeft]);

  useEffect(() => {
    /**
     * 特殊处理：右侧立绘
     */
    const thisFigKey = 'fig-right';
    const softInAniKey = 'fig-right-softin';
    if (figNameRight !== '') {
      const currentFigRight = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigRight) {
        if (currentFigRight.sourceUrl !== figNameRight) {
          removeFig(currentFigRight, softInAniKey, stageState.effects);
        }
      }
      const onLoaded = () => {
        logger.debug('右立绘已重设');
        const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
        WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
        setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects(softInAniKey), duration);
      };
      addFigure(onLoaded, undefined, thisFigKey, figNameRight, 'right');
    } else {
      const currentFigRight = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
      if (currentFigRight) {
        if (currentFigRight.sourceUrl !== figNameRight) {
          removeFig(currentFigRight, softInAniKey, stageState.effects);
        }
      }
    }
  }, [figNameRight]);

  useEffect(() => {
    // 自由立绘
    for (const fig of freeFigure) {
      /**
       * 特殊处理：自由立绘
       */
      const thisFigKey = `${fig.key}`;
      const softInAniKey = `${fig.key}-softin`;
      /**
       * 非空
       */
      if (fig.name !== '') {
        const currentFigThisKey = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
        if (currentFigThisKey) {
          if (currentFigThisKey.sourceUrl !== fig.name) {
            removeFig(currentFigThisKey, softInAniKey, stageState.effects);
            const onLoaded = () => {
              logger.debug(`${fig.key}立绘已重设`);
              const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
              WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
              setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects(softInAniKey), duration);
            };
            addFigure(onLoaded, undefined, thisFigKey, fig.name, fig.basePosition);
          }
        } else {
          const onLoaded = () => {
            logger.debug(`${fig.key}立绘已重设`);
            const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
            WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
            setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects(softInAniKey), duration);
          };
          addFigure(onLoaded, undefined, thisFigKey, fig.name, fig.basePosition);
        }
      } else {
        const currentFigThisKey = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisFigKey);
        if (currentFigThisKey) {
          if (currentFigThisKey.sourceUrl !== fig.name) {
            removeFig(currentFigThisKey, softInAniKey, stageState.effects);
          }
        }
      }
    }

    /**
     * 移除不在状态表中的立绘
     */
    const currentFigures = WebGAL.gameplay.pixiStage?.getFigureObjects();
    if (currentFigures) {
      for (const existFigure of currentFigures) {
        if (
          existFigure.key === 'fig-left' ||
          existFigure.key === 'fig-center' ||
          existFigure.key === 'fig-right' ||
          existFigure.key.endsWith('-off')
        ) {
          // 什么也不做
        } else {
          const existKey = existFigure.key;
          const existFigInState = freeFigure.findIndex((fig) => fig.key === existKey);
          if (existFigInState < 0) {
            const softInAniKey = `${existFigure.key}-softin`;
            removeFig(existFigure, softInAniKey, stageState.effects);
          }
        }
      }
    }
  }, [freeFigure]);
}

function removeFig(figObj: IStageObject, enterTikerKey: string, effects: IEffect[]) {
  WebGAL.gameplay.pixiStage?.removeAnimationWithSetEffects(enterTikerKey);
  // 快进，跳过退出动画
  if (WebGAL.gameplay.isFast) {
    logger.debug('快速模式，立刻关闭立绘');
    WebGAL.gameplay.pixiStage?.removeStageObjectByKey(figObj.key);
    return;
  }
  const oldFigKey = figObj.key;
  const figLeaveAniKey = oldFigKey + '-off';
  figObj.key = oldFigKey + String(new Date().getTime()) + '-off';
  const figKey = figObj.key;
  WebGAL.gameplay.pixiStage?.removeStageObjectByKey(oldFigKey);
  const leaveKey = figKey + '-softoff';
  const { duration, animation } = getEnterExitAnimation(figLeaveAniKey, 'exit', false, figKey);
  WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, leaveKey, figKey, effects);
  setTimeout(() => {
    WebGAL.gameplay.pixiStage?.removeAnimation(leaveKey);
    WebGAL.gameplay.pixiStage?.removeStageObjectByKey(figKey);
  }, duration);
}

async function addFigure(onLoaded: () => void, type?: 'image' | 'live2D' | 'spine', ...args: any[]) {
  const url = args[1];
  const baseUrl = window.location.origin;
  const urlObject = new URL(url, baseUrl);
  const _type = urlObject.searchParams.get('type') as 'image' | 'live2D' | 'spine' | null;
  if (url.endsWith('.json')) {
    return await addLive2dFigure(onLoaded, ...args);
  } else if (url.endsWith('.skel') || _type === 'spine') {
    // @ts-ignore
    return WebGAL.gameplay.pixiStage?.addSpineFigure(onLoaded, ...args);
  } else {
    // @ts-ignore
    return WebGAL.gameplay.pixiStage?.addFigure(onLoaded, ...args);
  }
}

/**
 * 如果要使用 Live2D，取消这里的注释
 * @param args
 */
function addLive2dFigure(onLoaded: () => void, ...args: any[]) {
  // @ts-ignore
  return WebGAL.gameplay.pixiStage?.addLive2dFigure(onLoaded, ...args);
}
