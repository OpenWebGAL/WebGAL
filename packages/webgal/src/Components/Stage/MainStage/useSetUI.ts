import { IEffect, IStageState } from '@/store/stageInterface';
import { useEffect } from 'react';
import { logger } from '@/Core/util/etc/logger';
import { IStageObject } from '@/Core/controller/stage/pixi/PixiController';
import { WebGAL } from '@/main';
import { getEnterExitAnimation } from '@/Core/Modules/animations';

export function useSetUI(stageState: IStageState) {
  const { ui } = stageState;

  /**
   * 设置 UI
   */
  useEffect(() => {
    for (const uiObject of ui) {
      const thisUIKey = `${uiObject.key}`;
      const softInAniKey = `${uiObject.key}-softin`;
      const uiObjectClickEvent = uiObject.clickEvent;
      const uiObjectNormal = uiObjectClickEvent === '' ? '' : uiObject.normal;
      const uiObjectOver = uiObject.over === '' ? uiObjectNormal : uiObject.over;
      /**
       * 非空
       */
      if (uiObjectNormal !== '') {
        const currentUIThisKey = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisUIKey);
        if (currentUIThisKey) {
          if (currentUIThisKey.sourceUrl !== uiObjectNormal) {
            removeUI(currentUIThisKey, softInAniKey, stageState.effects);
            WebGAL.gameplay.pixiStage?.addUI(thisUIKey, uiObjectNormal, uiObjectOver);
            logger.debug(`${uiObject.key} UI 已重设`);
            const { duration, animation } = getEnterExitAnimation(thisUIKey, 'enter');
            WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisUIKey, stageState.effects);
            setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimation(softInAniKey), duration);
          }
        } else {
          WebGAL.gameplay.pixiStage?.addUI(thisUIKey, uiObjectNormal, uiObjectOver);
          logger.debug(`${uiObject.key} UI 已重设`);
          const { duration, animation } = getEnterExitAnimation(thisUIKey, 'enter');
          WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisUIKey, stageState.effects);
          setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimation(softInAniKey), duration);
        }
      } else {
        // 获取对应的div元素, 并移除
        const uiElement = document.getElementById(thisUIKey);
        uiElement?.remove();
        // 删除pixi舞台上的元素
        const currentUIThisKey = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisUIKey);
        if (currentUIThisKey) {
          if (currentUIThisKey.sourceUrl !== uiObjectNormal) {
            removeUI(currentUIThisKey, softInAniKey, stageState.effects);
          }
        }
      }
    }

    /**
     * 移除不在状态表中的立绘
     */
    const currentUIs = WebGAL.gameplay.pixiStage?.getUIObjects();
    if (currentUIs) {
      for (const existUI of currentUIs) {
        if (existUI.key.endsWith('-off')) {
          // 什么也不做
        } else {
          const existKey = existUI.key;
          const existUIInState = ui.findIndex((uiObject) => uiObject.key === existKey);
          if (existUIInState < 0) {
            const softInAniKey = `${existUI.key}-softin`;
            removeUI(existUI, softInAniKey, stageState.effects);
          }
        }
      }
    }
  }, [ui]);
}

function removeUI(uiObj: IStageObject, enterTikerKey: string, effects: IEffect[]) {
  WebGAL.gameplay.pixiStage?.removeAnimationWithSetEffects(enterTikerKey);
  // 快进，跳过退出动画
  if (WebGAL.gameplay.isFast) {
    logger.info('快速模式，立刻关闭UI');
    WebGAL.gameplay.pixiStage?.removeStageObjectByKey(uiObj.key);
    return;
  }
  const oldUIKey = uiObj.key;
  uiObj.key = uiObj.key + '-off';
  WebGAL.gameplay.pixiStage?.removeStageObjectByKey(oldUIKey);
  const uiKey = uiObj.key;
  const leaveKey = uiKey + '-softoff';
  const { duration, animation } = getEnterExitAnimation(uiKey, 'exit');
  WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, leaveKey, uiKey, effects);
  setTimeout(() => {
    WebGAL.gameplay.pixiStage?.removeAnimation(leaveKey);
    WebGAL.gameplay.pixiStage?.removeStageObjectByKey(uiKey);
  }, duration);
}
