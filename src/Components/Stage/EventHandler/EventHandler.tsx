import {nextSentence} from "../../../Core/controller/gamePlay/nextSentence";
import {runScript} from "../../../Core/controller/gamePlay/runScript";
import {getRef} from "../../../Core/store/storeRef";
import {runtime_gamePlay} from "../../../Core/runtime/gamePlay";
import {useStore} from "reto";
import {stageStateStore} from "../../../Core/store/stage";
import React from "react";

export const EventHandler = () => {
    const stageStore = useStore(stageStateStore);
    const restoreOne = (index: number) => {
        runScript(getRef('stageRef').stageState.PerformList[index].script);
    }
    const restorePerform = () => {
        const len = getRef('stageRef').stageState.PerformList.length;
        for (let i = 0; i < len; i++) {
            const event = new MouseEvent('click', {
                'view': window,
                'bubbles': true,
                'cancelable': true,
                'clientX': i,
            });
            const textBox = document.getElementById('restoreOne_target');
            if (textBox !== null) {
                textBox.dispatchEvent(event);
            }
        }
    }

    const autoNextSentence = () => {
        nextSentence();
        runtime_gamePlay.autoTimeout = null;
    }

    return <div>
        <audio id={'currentBgm'} src={stageStore.stageState.bgm} loop={true} autoPlay={true}/>
        <audio id={'currentVocal'} src={stageStore.stageState.vocal}/>
        <div id={'nextSentence_target'} onClick={autoNextSentence}/>
        <div id={'restoreOne_target'} style={{display: 'none'}} onClick={(event) => restoreOne(event.clientX)}/>
        <div id={'restorePerform_target'} onClick={restorePerform} style={{display: 'none'}}/>
    </div>
}