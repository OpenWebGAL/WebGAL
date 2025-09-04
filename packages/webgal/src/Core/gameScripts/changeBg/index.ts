import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
// import {getRandomPerformName} from '../../../util/getRandomPerformName';
import styles from '@/Stage/stage.module.scss';
import { webgalStore } from '@/store/store';
import { setStage, stageActions } from '@/store/stageReducer';
import { getNumberArgByKey, getStringArgByKey } from '@/Core/util/getSentenceArg';
import { unlockCgInUserData } from '@/store/userDataReducer';
import { baseTransform } from '@/store/stageInterface';
import cloneDeep from 'lodash/cloneDeep';
import { createEnterExitAnimation } from '@/Core/Modules/animationFunctions';
import { WebGAL } from '@/Core/WebGAL';
import { STAGE_KEYS } from '@/Core/constants';

/**
 * 进行背景图片的切换
 * @param sentence 语句
 * @return {IPerform}
 */
export const changeBg = (sentence: ISentence): IPerform => {
  const url = sentence.content;
  const key = STAGE_KEYS.BG_MAIN;
  const unlockName = getStringArgByKey(sentence, 'unlockname') ?? '';
  const series = getStringArgByKey(sentence, 'series') ?? 'default';

  const dispatch = webgalStore.dispatch;
  if (unlockName !== '') {
    dispatch(unlockCgInUserData({ name: unlockName, url, series }));
  }

  // 储存一下现有的 transform 给退场动画当起始帧用, 因为马上就要清除了
  const currentEffect = webgalStore.getState().stage.effects.find((e) => e.target === key);
  let currentTransform = baseTransform;
  if (currentEffect?.transform) {
    currentTransform = cloneDeep(currentEffect.transform);
  }

  /**
   * 判断背景 URL 是否发生了变化
   */
  const isUrlChanged = webgalStore.getState().stage.bgName !== sentence.content;

  /**
   * 删掉相关 Effects，因为已经移除了
   */
  if (isUrlChanged) {
    dispatch(stageActions.removeEffectByTargetId(key));
  }

  let duration = createEnterExitAnimation(sentence, key, 1000, currentTransform);

  /**
   * 背景状态后处理
   */
  function postBgStateSet() {
    if (isUrlChanged) {
      // 当 URL 发生变化时，清理旧的 hold 动画
      WebGAL.gameplay.performController.unmountPerform(`animation-bg-main`, true);
    }
  }

  postBgStateSet();
  dispatch(setStage({ key: 'bgName', value: sentence.content }));

  return {
    performName: `${key}-${sentence.content}`,
    duration,
    isHoldOn: false,
    stopFunction: () => {
      WebGAL.gameplay.pixiStage?.stopPresetAnimationOnTarget(key);
    },
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
