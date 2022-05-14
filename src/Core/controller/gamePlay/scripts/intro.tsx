import { ISentence } from '@/Core/interface/coreInterface/sceneInterface';
import { IPerform } from '@/Core/interface/coreInterface/performInterface';
import React from 'react';
import ReactDOM from 'react-dom';
import styles from '../../../../Components/Stage/FullScreenPerform/fullScreenPerform.module.scss';
import {nextSentence} from "@/Core/controller/gamePlay/nextSentence";

/**
 * 显示一小段黑屏演示
 * @param sentence
 */
export const intro = (sentence: ISentence): IPerform => {
    const introArray: Array<string> = sentence.content.split(/\|/);
    const showIntro = introArray.map((e, i) => <div key={'introtext' + i + Math.random().toString()}
                                                    style={{animationDelay: `${1500 * i}ms`}}
                                                    className={styles.introElement}>
        {e}
    </div>);
    const intro = <div>
        {showIntro}
    </div>;
    ReactDOM.render(intro, document.getElementById('introContainer'));
    const introContainer = document.getElementById('introContainer');

    if (introContainer) {
        introContainer.style.display = 'block';
    }
    return {
        performName: 'introPerform',
        duration: 1000 + 1500 * introArray.length,
        isOver: false,
        isHoldOn: false,
        stopFunction: () => {
            const introContainer = document.getElementById('introContainer');
            if (introContainer) {
                introContainer.style.display = 'none';
            }
            nextSentence();
        },
        blockingNext: () => false,
        blockingAuto: () => true,
        stopTimeout: undefined, // 暂时不用，后面会交给自动清除
    };
};
