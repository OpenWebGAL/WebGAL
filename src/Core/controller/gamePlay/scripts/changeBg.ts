import { ISentence } from '../../../interface/coreInterface/sceneInterface';
import { IPerform } from '../../../interface/coreInterface/performInterface';
import { getRandomPerformName } from '../../../util/getRandomPerformName';
import styles from '../../../../Components/Stage/mainStage.module.scss';
import { getRef } from '../../../store/storeRef';

/**
 * 进行背景图片的切换
 * @param sentence 语句
 * @return {IPerform}
 */
export const changeBg = (sentence: ISentence): IPerform => {
    const oldBgName = getRef('stageRef').stageState.bgName;
    getRef('stageRef').setStage('oldBgName', oldBgName); // 改变旧背景，使其渐变消失
    getRef('stageRef').setStage('bgName', sentence.content); // 改变新背景，使其呈现
    const performInitName: string = getRandomPerformName();
    return {
        performName: performInitName,
        duration: 1000,
        isOver: false,
        isHoldOn: false,
        stopFunction: () => {
            // const bgContainer = document.getElementById('MainStage_bg_MainContainer');
            // if (bgContainer) bgContainer.className = styles.MainStage_bgContainer;
            const oldBgContainer = document.getElementById('MainStage_bg_OldContainer');
            if (oldBgContainer) {
                oldBgContainer.className = styles.MainStage_oldBgContainer_Settled;
            }
        },
        blockingNext: () => false,
        blockingAuto: () => true,
        stopTimeout: undefined, // 暂时不用，后面会交给自动清除
    };
};
