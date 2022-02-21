import {WG_ViewControl} from "../../ViewController/ViewControl";
import {increaseSentence, nextSentenceProcessor} from "../../WG_core";

const setFigAni = (S_content) => {
    let pos;
    let aniName;
    let aniTime;
    if (S_content.match(/ -/)) {
        const aniArg = S_content.split(/ -/)[0];
        const posArg = S_content.split(/ -/)[1];
        WG_ViewControl.VC_setAnimationByClass2('figureContainer' + posArg, aniArg);
        increaseSentence();
        nextSentenceProcessor();
        return {'ret': true, 'autoPlay': false};
    } else {
        pos = S_content.split(',')[0];
        aniName = S_content.split(',')[1];
        aniTime = S_content.split(',')[2];
        WG_ViewControl.VC_setAnimationByClass('figureContainer' + pos, aniName, aniTime);
        increaseSentence();
        nextSentenceProcessor();
        return {'ret': true, 'autoPlay': false};
    }
}
const setBgAni = (S_content) => {
    if (S_content.match(/ /)) {
        const aniArg = S_content.split(/ -/)[0];
        WG_ViewControl.VC_setAnimationById2('mainBackground', aniArg);
        increaseSentence();
        nextSentenceProcessor();
        return {'ret': true, 'autoPlay': false};
    }
    let aniName = S_content.split(',')[0];
    let aniTime = S_content.split(',')[1];
    WG_ViewControl.VC_setAnimationById('mainBackground', aniName, aniTime);
    increaseSentence();
    nextSentenceProcessor();
    return {'ret': true, 'autoPlay': false};
}

export {setFigAni, setBgAni};

