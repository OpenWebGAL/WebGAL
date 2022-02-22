import {getRuntime, initcurrentInfo, SyncCurrentStatus} from "../../StoreControl/StoreControl";
import {WG_ViewControl} from "../../ViewController/ViewControl";
import {userInteract} from "../../InteractController/UserInteract";
import logger from "../../util/logger";

const gameEnd = () => {
    //首先初始化状态列表
    logger.debug('初始化场景',initcurrentInfo)
    getRuntime().currentScene = '';
    WG_ViewControl.VC_resetStage();
    document.getElementById('Title').style.display = 'block';
    getRuntime().temp_bgm_TitleToGameplay = getRuntime().currentInfo.bgm;
    SyncCurrentStatus('bgm', getRuntime().GameInfo['Title_bgm']);
    WG_ViewControl.loadBGM();
}

export default gameEnd;