import {getScene, SyncCurrentStatus} from "../../StoreControl/StoreControl";

const changeScene = (S_content)=>{
    let sUrl = "game/scene/" + S_content;
    getScene(sUrl);
    SyncCurrentStatus('SceneName', S_content);
    return {'ret': true, 'autoPlay': false};
}
export default changeScene;