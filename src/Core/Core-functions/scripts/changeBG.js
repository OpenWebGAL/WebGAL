import {WG_ViewControl} from "../../ViewController/ViewControl";
import {SyncCurrentStatus} from "../../StoreControl/StoreControl";
import {increaseSentence, nextSentenceProcessor} from "../../WG_core";

const changeBG = (S_content) => {
    //捕捉到参数next
    if(S_content.match(/ -next/)){
        S_content = S_content.split(' ')[0];
        WG_ViewControl.VC_changeBG(S_content);
        increaseSentence();
        SyncCurrentStatus("bg_Name", S_content);
        nextSentenceProcessor();
        return {'ret': true, 'autoPlay': false};
    }
    WG_ViewControl.VC_changeBG(S_content);//界面控制：换背景
    SyncCurrentStatus("bg_Name", S_content);//同步当前状态
    return {'ret': false, 'autoPlay': true}//ret:是否执行后return；autoPlay:在非next语句下调用autoplay
}

const changeBG_next = (S_content) => {
    WG_ViewControl.VC_changeBG(S_content);
    increaseSentence();
    SyncCurrentStatus("bg_Name", S_content);
    nextSentenceProcessor();
    return {'ret': true, 'autoPlay': false};
}

export {changeBG_next, changeBG};