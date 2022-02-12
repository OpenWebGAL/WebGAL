import {userInteract} from "../../Core/InteractController/UserInteract";
import cross from "../../assets/img/cross.svg";
import up from "../../assets/img/up.svg";
import {nextSentenceProcessor} from "../../Core/WG_core";
import {WG_ViewControl} from "../../Core/ViewController/ViewControl";
import {DoubleRight, FolderDownload, FolderUpload, Home, PlayOne, ReplayMusic, SettingTwo} from "@icon-park/react";

const BottomBox = ()=>{
    return <div id="bottomBox">
        <div id="top_control">
                    <span className="top_button" onClick={userInteract.hideTextBox}>
                        <img alt={"cross"} src={cross} style={{width: "22px", height: "22px"}}/>
                    </span>
            <span className="top_button" onClick={userInteract.showBacklog}>
                        <img alt={"up"} src={up} style={{width: "25px", height: "25px"}}/>
                    </span>
        </div>
        <div id="mainTextWindow" onClick={nextSentenceProcessor}>
            <div id="pName"/>
            <div id="SceneText"/>
        </div>
        <div id="controlBar">
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
        <div id={"miniAvatar"} onClick={nextSentenceProcessor}/>
    </div>
}

export default BottomBox;