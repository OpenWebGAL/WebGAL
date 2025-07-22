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
  bgObject.key = 'bg-main-off' + String(new Date().getTime());
  const bgKey = bgObject.key;
  const bgAniKey = bgObject.key + '-softoff';
  WebGAL.gameplay.pixiStage?.removeStageObjectByKey(oldBgKey);
  const { duration, animation } = getEnterExitAnimation('bg-main-off', 'exit', true, bgKey);
  WebGAL.gameplay.pixiStage!.registerAnimation(animation, bgAniKey, bgKey);
  setTimeout(() => {
    WebGAL.gameplay.pixiStage?.removeAnimation(bgAniKey);
    WebGAL.gameplay.pixiStage?.removeStageObjectByKey(bgKey);
  }, duration);
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
