import {ISentence} from '@/Core/interface/coreInterface/sceneInterface';
import {IPerform} from '@/Core/interface/coreInterface/performInterface';
// import {getRandomPerformName} from '../../../util/getRandomPerformName';
import styles from '../../../../Components/Stage/mainStage.module.scss';
import {getRef} from '@/Core/store/storeRef';

/**
 * 进行背景图片的切换
 * @param sentence 语句
 * @return {IPerform}
 */
export const changeBg = (sentence: ISentence): IPerform => {
    const oldBgName = getRef('stageRef')!.current!.stageState.bgName;
    getRef('stageRef')!.current!.setStage('oldBgName', oldBgName); // 改变旧背景，使其渐变消失
    getRef('stageRef')!.current!.setStage('bgName', sentence.content); // 改变新背景，使其呈现
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
