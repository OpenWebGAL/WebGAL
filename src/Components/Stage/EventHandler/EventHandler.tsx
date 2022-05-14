import {nextSentence} from "@/Core/controller/gamePlay/nextSentence";
import {runScript} from "@/Core/controller/gamePlay/runScript";
import {runtime_gamePlay} from "@/Core/runtime/gamePlay";
import {setVolume} from "@/Core/util/setVolume";
import {useSelector} from "react-redux";
import {RootState} from "@/Core/store/store";

export const EventHandler = () => {
    const stageStore = useSelector((webgalStore: RootState) => webgalStore.stage);
    const restoreOne = (index: number) => {
        runScript(stageStore.PerformList[index].script);
    };
    const restorePerform = () => {
        const len = stageStore.PerformList.length;
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
    };

    const autoNextSentence = () => {
        nextSentence();
        runtime_gamePlay.autoTimeout = null;
    };

    return <div>
        <audio id="currentBgm" src={stageStore.bgm} loop={true} autoPlay={true}/>
        <audio id="currentVocal" src={stageStore.vocal}/>
        <div id="nextSentence_target" onClick={autoNextSentence}/>
        <div id="restoreOne_target" style={{display: 'none'}} onClick={(event) => restoreOne(event.clientX)}/>
        <div id="restorePerform_target" onClick={restorePerform} style={{display: 'none'}}/>
        <div id="setVolume_target" onClick={setVolume}/>
    </div>;
};
