import { IEffect, IStageState } from '@/store/stageInterface';
import { useEffect } from 'react';
import { logger } from '@/Core/util/etc/logger';
import { generateUniversalSoftInAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftIn';
import { IStageObject } from '@/Core/controller/stage/pixi/PixiController';
import { generateUniversalSoftOffAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftOff';
import { WebGAL } from '@/main';
import { getEnterExitAnimation } from '@/Core/Modules/animations';

export function useSetFigure(stageState: IStageState) {
  const { figNameLeft, figName, figNameRight, freeFigure } = stageState;

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
      WebGAL.gameplay.pixiStage?.addFigure(thisFigKey, figName, 'center');
      logger.debug('中立绘已重设');
      const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
      WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
      setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimation(softInAniKey), duration);
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
      WebGAL.gameplay.pixiStage?.addFigure(thisFigKey, figNameLeft, 'left');
      logger.debug('左立绘已重设');
      const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
      WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
      setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimation(softInAniKey), duration);
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
      WebGAL.gameplay.pixiStage?.addFigure(thisFigKey, figNameRight, 'right');
      logger.debug('右立绘已重设');
      const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
      WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
      setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimation(softInAniKey), duration);
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
            WebGAL.gameplay.pixiStage?.addFigure(thisFigKey, fig.name, fig.basePosition);
            logger.debug(`${fig.key}立绘已重设`);
            const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
            WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
            setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimation(softInAniKey), duration);
          }
        } else {
          WebGAL.gameplay.pixiStage?.addFigure(thisFigKey, fig.name, fig.basePosition);
          logger.debug(`${fig.key}立绘已重设`);
          const { duration, animation } = getEnterExitAnimation(thisFigKey, 'enter');
          WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisFigKey, stageState.effects);
          setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimation(softInAniKey), duration);
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
    logger.info('快速模式，立刻关闭立绘');
    WebGAL.gameplay.pixiStage?.removeStageObjectByKey(figObj.key);
    return;
  }
  const oldFigKey = figObj.key;
  figObj.key = figObj.key + '-off';
  WebGAL.gameplay.pixiStage?.removeStageObjectByKey(oldFigKey);
  const figKey = figObj.key;
  const leaveKey = figKey + '-softoff';
  const { duration, animation } = getEnterExitAnimation(figKey, 'exit');
  WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, leaveKey, figKey, effects);
  setTimeout(() => {
    WebGAL.gameplay.pixiStage?.removeAnimation(leaveKey);
    WebGAL.gameplay.pixiStage?.removeStageObjectByKey(figKey);
  }, duration);
}
