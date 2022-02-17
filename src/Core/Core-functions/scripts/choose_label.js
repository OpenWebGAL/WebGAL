import {SyncCurrentStatus} from "../../StoreControl/StoreControl";
import {WG_ViewControl} from "../../ViewController/ViewControl";
import {processSelection} from "../../util/WG_util";

const choose_label = (S_content) => {
    SyncCurrentStatus('command', 'choose_label');
    SyncCurrentStatus('choose', S_content);
    const selection = processSelection(S_content);
    WG_ViewControl.VC_choose(selection, 'label')
    return {'ret': true, 'autoPlay': false};
}
export default choose_label;