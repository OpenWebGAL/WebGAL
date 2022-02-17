import {SyncCurrentStatus} from "../../StoreControl/StoreControl";
import {WG_ViewControl} from "../../ViewController/ViewControl";
import {increaseSentence, nextSentenceProcessor} from "../../WG_core";

const bgm = (S_content) => {
    SyncCurrentStatus('bgm', S_content);
    // getRuntime().currentInfo["bgm"] =  S_content;
    WG_ViewControl.loadBGM();
    increaseSentence();
    nextSentenceProcessor();
    return {'ret': true, 'autoPlay': false};
}

export default bgm;