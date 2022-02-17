import {WG_ViewControl} from "../../ViewController/ViewControl";
import {SyncCurrentStatus} from "../../StoreControl/StoreControl";
import {increaseSentence, nextSentenceProcessor} from "../../WG_core";

const setBgTransform = (S_content) => {
    setTimeout(() => {
        WG_ViewControl.VC_setBGtransform(S_content);
    }, 100);
    SyncCurrentStatus('bg_transform', S_content);
    increaseSentence();
    nextSentenceProcessor();
    return {'ret': true, 'autoPlay': false};
}
const setBgFilter = (S_content) => {
    setTimeout(() => {
        WG_ViewControl.VC_setBGfilter(S_content);
    }, 100);
    SyncCurrentStatus('bg_filter', S_content);
    increaseSentence();
    nextSentenceProcessor();
    return {'ret': true, 'autoPlay': false};
}

export {setBgTransform, setBgFilter};