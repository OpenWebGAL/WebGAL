import {WG_ViewControl} from "../../Core/ViewController/ViewControl";
import {DoubleRight, FolderDownload, FolderUpload, Home, PlayOne, ReplayMusic, SettingTwo} from "@icon-park/react";
import {userInteract} from "../../Core/InteractController/UserInteract";

const ControlBar = ()=>{
    return <div id="controlBar">
        <div className="controlButton" onClick={WG_ViewControl.playVocal}>
            <ReplayMusic theme="outline" size="28" fill="#f5f5f7"/>
        </div>
        <div className="controlButton" onClick={userInteract.autoNext} id="autoButton">
            <PlayOne theme="outline" size="28" fill="#f5f5f7"/>
        </div>
        <div className="controlButton" onClick={userInteract.fastNext} id="fastButton">
            <DoubleRight theme="outline" size="28" fill="#f5f5f7"/>
        </div>
        <div className="controlButton" onClick={userInteract.onSaveGame} id="saveButton">
            <FolderDownload theme="outline" size="28" fill="#f5f5f7"/>
        </div>
        <div className="controlButton" onClick={userInteract.onLoadGame} id="loadButton">
            <FolderUpload theme="outline" size="28" fill="#f5f5f7"/>
        </div>
        <div className="controlButton" onClick={userInteract.onSetting}>
            <SettingTwo theme="outline" size="28" fill="#f5f5f7"/>
        </div>
        <div className="controlButton" onClick={userInteract.Title} id="titleButton">
            <Home theme="outline" size="28" fill="#f5f5f7"/>
        </div>
    </div>
}
export default ControlBar;