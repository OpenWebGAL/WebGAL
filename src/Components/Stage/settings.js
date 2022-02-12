import {userInteract} from "../../Core/InteractController/UserInteract";
import closeB from "../../assets/img/closeBlack.svg";

const Settings = ()=>{
    return <div id="settings">
        <div id="settingsMainBox">
            <div id="close" onClick={userInteract.closeSettings}>
                <img src={closeB} className="closeSVG" alt="close"/>
            </div>
            <div id="settingsTitle">
                设置
            </div>
            <div id="settingItems"/>
            <div id="textPreview"/>
        </div>
    </div>
}

export default Settings;