import logger from "../../util/logger";
import {getRuntime, getStatus, SyncCurrentStatus} from "../../StoreControl/StoreControl";
import {WG_ViewControl} from "../../ViewController/ViewControl";

const showVar=(S_content)=>{
    logger.info("显示变量");
    SyncCurrentStatus('command', 'showVar');
    SyncCurrentStatus('showName', 'showVar');
    SyncCurrentStatus('showText', JSON.stringify(getRuntime().currentInfo.GameVar));
    WG_ViewControl.VC_textShow(getStatus('showName'), getStatus('showText'));
    return{'ret':false,'autoPlay':false,'toBacklog':true};
}

export default showVar;