import {WG_ViewControl} from "../../ViewController/ViewControl";
import {increaseSentence, nextSentenceProcessor} from "../../WG_core";

const setFigAni = (S_content) => {
    let pos = S_content.split(',')[0];
    let aniName = S_content.split(',')[1];
    let aniTime = S_content.split(',')[2];
    WG_ViewControl.VC_setAnimationByClass('figureContainer' + pos, aniName, aniTime);
    increaseSentence();
    nextSentenceProcessor();
    return {'ret': true, 'autoPlay': false};
}
const setBgAni = (S_content) => {
    let aniName = S_content.split(',')[0];
    let aniTime = S_content.split(',')[1];
    WG_ViewControl.VC_setAnimationById('mainBackground', aniName, aniTime);
    increaseSentence();
    nextSentenceProcessor();
    return {'ret': true, 'autoPlay': false};
}

export {setFigAni,setBgAni};

