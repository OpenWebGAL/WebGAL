import { IStageState } from '@/store/stageInterface';
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
    if (bgName !== '') {
      const currentBg = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisBgKey);
      if (currentBg) {
        if (currentBg.sourceUrl !== bgName) {
          removeBg(currentBg);
        }
      }
      addBg(undefined, thisBgKey, bgName);
      setEbg(bgName);
      logger.debug('重设背景');
      const { duration, animation } = getEnterExitAnimation('bg-main', 'enter', true);
      WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, 'bg-main-softin', thisBgKey, stageState.effects);
      setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects('bg-main-softin'), duration);
    } else {
      const currentBg = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisBgKey);
      if (currentBg) {
        removeBg(currentBg);
      }
    }
  }, [bgName]);
}

function removeBg(bgObject: IStageObject) {
  WebGAL.gameplay.pixiStage?.removeAnimationWithSetEffects('bg-main-softin');
  const oldBgKey = bgObject.key;
  bgObject.key = 'bg-main-off';
  WebGAL.gameplay.pixiStage?.removeStageObjectByKey(oldBgKey);
  const { duration, animation } = getEnterExitAnimation('bg-main-off', 'exit', true);
  WebGAL.gameplay.pixiStage!.registerAnimation(animation, 'bg-main-softoff', 'bg-main-off');
  setTimeout(() => {
    WebGAL.gameplay.pixiStage?.removeAnimation('bg-main-softoff');
    WebGAL.gameplay.pixiStage?.removeStageObjectByKey('bg-main-off');
  }, duration);
}

function addBg(type?: 'image' | 'spine', ...args: any[]) {
  const url = args[1];
  if (url.endsWith('.skel')) {
    // @ts-ignore
    return WebGAL.gameplay.pixiStage?.addSpineBg(...args);
  } else {
    // @ts-ignore
    return WebGAL.gameplay.pixiStage?.addBg(...args);
  }
}