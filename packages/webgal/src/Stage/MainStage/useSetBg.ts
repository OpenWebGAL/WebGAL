import { IStageState } from '@/store/stageInterface';
import { useEffect } from 'react';
import { logger } from '@/Core/util/logger';
import { IStageObject } from '@/Core/controller/stage/pixi/PixiController';
import { setEbg } from '@/Core/gameScripts/changeBg/setEbg';

import { getEnterExitAnimation } from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';
import { DEFAULT_BG_OUT_DURATION } from '@/Core/constants';

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
      logger.debug('重设背景');
      const { duration, animation } = getEnterExitAnimation('bg-main', 'enter', true);
      setEbg(bgName, duration);
      WebGAL.gameplay.pixiStage!.registerPresetAnimation(animation, 'bg-main-softin', thisBgKey, stageState.effects);
      setTimeout(() => WebGAL.gameplay.pixiStage!.removeAnimationWithSetEffects('bg-main-softin'), duration);
    } else {
      let exitDuration = DEFAULT_BG_OUT_DURATION;
      const currentBg = WebGAL.gameplay.pixiStage?.getStageObjByKey(thisBgKey);
      if (currentBg) {
        exitDuration = removeBg(currentBg);
      }
      setEbg(bgName, exitDuration, 'cubic-bezier(0.5, 0, 0.75, 0)');
    }
  }, [bgName]);
}

function removeBg(bgObject: IStageObject): number {
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
  return duration;
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
