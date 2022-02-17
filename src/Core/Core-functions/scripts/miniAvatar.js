import {increaseSentence, nextSentenceProcessor} from "../../WG_core";
import {SyncCurrentStatus} from "../../StoreControl/StoreControl";
import {WG_ViewControl} from "../../ViewController/ViewControl";

const miniAvatar=(S_content)=>{
    WG_ViewControl.VC_showMiniAvatar(S_content);
    SyncCurrentStatus('miniAvatar', S_content);
    increaseSentence();
    nextSentenceProcessor();
    return {'ret': true, 'autoPlay': false};
}

export default miniAvatar;