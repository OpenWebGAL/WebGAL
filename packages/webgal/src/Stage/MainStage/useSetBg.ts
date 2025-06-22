import { IEffect, IStageState } from '@/store/stageInterface';
import { useEffect } from 'react';
import { logger } from '@/Core/util/logger';
import { IStageObject } from '@/Core/controller/stage/pixi/PixiController';
import { setEbg } from '@/Core/gameScripts/changeBg/setEbg';

import { getEnterExitAnimation } from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';

export function useSetBg(stageState: IStageState) {
  const bgName = stageState.bgName;

  /**
   * 设置背景
   */
  useEffect(() => {
    const thisBgKey = 'bg-main';
    const softInAniKey = `bg-main-softin`;
    if (bgName !== '') {
      const currentBg = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisBgKey);
      if (currentBg) {
        if (currentBg.sourceUrl !== bgName) {
          removeBg(currentBg, 'bg-main-softin', stageState.effects);
        }
      }
      addBg(undefined, thisBgKey, bgName);
      setEbg(bgName);
      logger.debug('重设背景');
      const { duration, animation } = getEnterExitAnimation('bg-main', 'enter', true);
      const stopFunction = () => {
        WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects(softInAniKey);
      };
      WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, softInAniKey, thisBgKey, stageState.effects, stopFunction);
    } else {
      const currentBg = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisBgKey);
      if (currentBg) {
        removeBg(currentBg, softInAniKey, stageState.effects);
      }
    }
  }, [bgName]);
}

function removeBg(bgObject: IStageObject, enterTickerKey: string, effects: IEffect[]) {
  WebGAL.gameplay.pixiStage?.removeAnimationWithSetEffects(enterTickerKey);
  // 快进，跳过退出动画
  if (WebGAL.gameplay.isFast) {
    logger.debug('快速模式，立刻关闭立绘');
    WebGAL.gameplay.pixiStage?.removeStageObjectByKey(bgObject.key);
    return;
  }
  const oldBgKey = bgObject.key;
  const bgLeaveAniKey = oldBgKey + '-off';
  bgObject.key = oldBgKey + '-old' + '-off';
  const bgKey = bgObject.key;
  const bgAniKey = bgObject.key + '-softoff';
  WebGAL.gameplay.pixiStage?.removeStageObjectByKey(oldBgKey);
  const { duration, animation } = getEnterExitAnimation(bgLeaveAniKey, 'exit', true, bgKey);
  const stopFunction = () => {
    WebGAL.gameplay.pixiStage?.removeStageObjectByKey(bgKey);
  };
  WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, bgAniKey, bgKey, effects, stopFunction);
}

function addBg(type?: 'image' | 'spine', ...args: any[]) {
  const url: string = args[1];
  if (['mp4', 'webm', 'mkv'].some((e) => url.toLocaleLowerCase().endsWith(e))) {
    // @ts-ignore
    return WebGAL.gameplay.pixiStage?.addVideoBg(...args);
  } else if (url.toLocaleLowerCase().endsWith('.skel')) {
    // @ts-ignore
    return WebGAL.gameplay.pixiStage?.addSpineBg(...args);
  } else {
    // @ts-ignore
    return WebGAL.gameplay.pixiStage?.addBg(...args);
  }
}
