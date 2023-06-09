import { ISentence } from '@/Core/controller/scene/sceneInterface';
import { IPerform } from '@/Core/Modules/perform/performInterface';
// import {getRandomPerformName} from '../../../util/getRandomPerformName';
import styles from '../../Components/Stage/stage.module.scss';
import { webgalStore } from '@/store/store';
import { setStage } from '@/store/stageReducer';

/**
 * 进行背景图片的切换
 * @param sentence 语句
 * @return {IPerform}
 */
export const changeBg = (sentence: ISentence): IPerform => {
  const dispatch = webgalStore.dispatch;
  dispatch(setStage({ key: 'bgName', value: sentence.content }));
  // const performInitName: string = getRandomPerformName();
  return {
    performName: 'none',
    duration: 1000,
    isHoldOn: false,
    stopFunction: () => {
      // const bgContainer = document.getElementById('MainStage_bg_MainContainer');
      // if (bgContainer) bgContainer.className = styles.MainStage_bgContainer;
      const BgContainer = document.getElementById('MainStage_bg_MainContainer');
      if (BgContainer) {
        BgContainer.className = styles.MainStage_bgContainer_Settled;
      }
    },
    blockingNext: () => false,
    blockingAuto: () => true,
    stopTimeout: undefined, // 暂时不用，后面会交给自动清除
  };
};
