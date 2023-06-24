import { IStageState } from '@/store/stageInterface';
import { useEffect } from 'react';
import { logger } from '@/Core/util/etc/logger';
import { IStageObject } from '@/Core/controller/stage/pixi/PixiController';
import { generateUniversalSoftOffAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftOff';
import { generateUniversalSoftInAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftIn';
import { setEbg } from '@/Core/util/setEbg';
import { WebGAL } from '@/main';
import { getAnimateDuration, getAnimationObject } from '@/Core/Modules/animations';

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
      WebGAL.gameplay.pixiStage?.addBg(thisBgKey, bgName);
      setEbg(bgName);
      logger.debug('重设背景');
      let duration = 1000;
      // 走默认动画
      let animation: {
        setStartState: () => void;
        tickerFunc: (delta: number) => void;
        setEndState: () => void;
      } | null = generateUniversalSoftInAnimationObj(thisBgKey, duration);
      if (WebGAL.animationManager.nextEnterAnimationName !== '') {
        animation = getAnimationObject(
          WebGAL.animationManager.nextEnterAnimationName,
          thisBgKey,
          getAnimateDuration(WebGAL.animationManager.nextEnterAnimationName),
        );
        duration = getAnimateDuration(WebGAL.animationManager.nextEnterAnimationName);
        // 用后重置
        WebGAL.animationManager.nextEnterAnimationName = '';
      }
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
  let duration = 1000;
  // 走默认动画
  let animation: {
    setStartState: () => void;
    tickerFunc: (delta: number) => void;
    setEndState: () => void;
  } | null = generateUniversalSoftOffAnimationObj('bg-main-off', duration);
  if (WebGAL.animationManager.nextExitAnimationName !== '') {
    animation = getAnimationObject(
      WebGAL.animationManager.nextExitAnimationName,
      'bg-main-off',
      getAnimateDuration(WebGAL.animationManager.nextExitAnimationName),
    );
    duration = getAnimateDuration(WebGAL.animationManager.nextExitAnimationName);
    // 用后重置
    WebGAL.animationManager.nextExitAnimationName = '';
  }
  WebGAL.gameplay.pixiStage!.registerAnimation(animation, 'bg-main-softoff', 'bg-main-off');
  setTimeout(() => {
    WebGAL.gameplay.pixiStage?.removeAnimation('bg-main-softoff');
    WebGAL.gameplay.pixiStage?.removeStageObjectByKey('bg-main-off');
  }, duration);
}
