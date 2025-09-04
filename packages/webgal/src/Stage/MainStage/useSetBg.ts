import { IStageState } from '@/store/stageInterface';
import { useEffect } from 'react';
import { logger } from '@/Core/util/logger';
import { IStageObject } from '@/Core/controller/stage/pixi/PixiController';
import { setEbg } from '@/Core/gameScripts/changeBg/setEbg';

import { addOrRemoveStageObject } from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';
import { STAGE_KEYS } from '@/Core/constants';

export function useSetBg(stageState: IStageState) {
  const bgName = stageState.bgName;

  /**
   * 设置背景
   */
  useEffect(() => {
    const thisBgKey = STAGE_KEYS.BG_MAIN;
    addOrRemoveStageObject(thisBgKey, bgName, stageState.effects, () => {
      addBg(undefined, thisBgKey, bgName);
      setEbg(bgName);
    });
  }, [bgName]);
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
