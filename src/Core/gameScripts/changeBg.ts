import {ISentence} from '@/Core/interface/coreInterface/sceneInterface';
import {IPerform} from '@/Core/interface/coreInterface/performInterface';
// import {getRandomPerformName} from '../../../util/getRandomPerformName';
import styles from '../../Components/Stage/mainStage.module.scss';
import {webgalStore} from '@/Core/store/store';
import {setStage} from "@/Core/store/stageReducer";

/**
 * 进行背景图片的切换
 * @param sentence 语句
 * @return {IPerform}
 */
export const changeBg = (sentence: ISentence): IPerform => {
  const stageState = webgalStore.getState().stage;
  const oldBgName = stageState.bgName;
  const dispatch = webgalStore.dispatch;
  dispatch(setStage({key: 'oldBgName', value: oldBgName}));
  dispatch(setStage({key: 'bgName', value: sentence.content}));
  // const performInitName: string = getRandomPerformName();
  return {
    performName: 'none',
    duration: 1000,
    isOver: false,
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
