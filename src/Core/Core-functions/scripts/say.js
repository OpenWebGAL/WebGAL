import {getStatus, SyncCurrentStatus} from "../../StoreControl/StoreControl";
import {processSentence} from "../../util/WG_util";
import {WG_ViewControl} from "../../ViewController/ViewControl";

const say = (S_content) => {
    SyncCurrentStatus('command', processSentence(getStatus("SentenceID"))['name']);
    SyncCurrentStatus('showName', processSentence(getStatus("SentenceID"))['name']);
    SyncCurrentStatus('showText', processSentence(getStatus("SentenceID"))['text']);
    SyncCurrentStatus('vocal', processSentence(getStatus("SentenceID"))['vocal']);
    WG_ViewControl.VC_textShow(getStatus('showName'), getStatus('showText'));
    if (getStatus("all")["vocal"] !== '') {
        WG_ViewControl.playVocal();
    }
    return {'ret': false, 'autoPlay': false,'toBacklog':true}
}

export default say;