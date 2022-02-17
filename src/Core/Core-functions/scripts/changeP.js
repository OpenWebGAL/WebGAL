import {WG_ViewControl} from "../../ViewController/ViewControl";
import {SyncCurrentStatus} from "../../StoreControl/StoreControl";
import {increaseSentence, nextSentenceProcessor} from "../../WG_core";

const changeP = (S_content) => {
    WG_ViewControl.VC_changeP(S_content, 'center');
    SyncCurrentStatus('fig_Name', S_content);
    return {'ret': false, 'autoPlay': true};
}
const changeP_left = (S_content) => {
    WG_ViewControl.VC_changeP(S_content, 'left');
    SyncCurrentStatus('fig_Name_left', S_content);
    return {'ret': false, 'autoPlay': true};
}
const changeP_right = (S_content) => {
    WG_ViewControl.VC_changeP(S_content, 'right');
    SyncCurrentStatus('fig_Name_right', S_content);
    return {'ret': false, 'autoPlay': true};
}
const changeP_next = (S_content) => {
    WG_ViewControl.VC_changeP(S_content, 'center');
    SyncCurrentStatus('fig_Name', S_content);
    increaseSentence();
    nextSentenceProcessor();
    return {'ret': true, 'autoPlay': false};
}
const changeP_left_next = (S_content) => {
    WG_ViewControl.VC_changeP(S_content, 'left');
    SyncCurrentStatus('fig_Name_left', S_content);
    increaseSentence();
    nextSentenceProcessor();
    return {'ret': true, 'autoPlay': false};
}
const changeP_right_next = (S_content) => {
    WG_ViewControl.VC_changeP(S_content, 'right')
    SyncCurrentStatus('fig_Name_right', S_content);
    increaseSentence();
    nextSentenceProcessor();
    return {'ret': true, 'autoPlay': false};
}

export {changeP,changeP_left,changeP_right,changeP_next,changeP_left_next,changeP_right_next}