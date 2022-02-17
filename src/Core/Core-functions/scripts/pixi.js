import {getRuntime} from "../../StoreControl/StoreControl";
import {WG_ViewControl} from "../../ViewController/ViewControl";
import {increaseSentence, nextSentenceProcessor} from "../../WG_core";

const pixiInit = (S_content) => {
    getRuntime().currentInfo['pixiPerformList'] = [];
    WG_ViewControl.VC_PIXI_Create();
    increaseSentence();
    nextSentenceProcessor();
    return {'ret': true, 'autoPlay': false};
}
const pixiPerform = (S_content) => {
    const performType = S_content;
    const option = {};
    const pixiOption = {performType: performType, option: option};
    getRuntime().currentInfo['pixiPerformList'].push(pixiOption);
    WG_ViewControl.VC_PIXI_perform(performType, option);
    increaseSentence();
    nextSentenceProcessor();
    return {'ret': true, 'autoPlay': false};
}

export {pixiPerform, pixiInit}