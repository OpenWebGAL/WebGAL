import {SyncCurrentStatus} from "../../StoreControl/StoreControl";
import {processSelection} from "../../util/WG_util";
import {WG_ViewControl} from "../../ViewController/ViewControl";

const choose = (S_content)=>{
    SyncCurrentStatus('command', 'choose');
    SyncCurrentStatus('choose', S_content);
    const selection = processSelection(S_content);
    WG_ViewControl.VC_choose(selection, 'scene');
    return {'ret': true, 'autoPlay': false};
}

export default choose;