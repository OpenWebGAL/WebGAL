import {WG_ViewControl} from "../../Core/ViewController/ViewControl";
import {
    AlignTextLeftOne,
    DoubleRight,
    FolderDownload,
    FolderUpload,
    Home,
    // Log,
    PlayOne,
    ReplayMusic,
    SettingTwo
} from "@icon-park/react";
import {userInteract} from "../../Core/InteractController/UserInteract";

const ControlBar = ()=>{
    const showControlText = false;
    return <div id="controlBar">
        <div className="controlButton" onClick={userInteract.showBacklog} id="titleButton">
            <AlignTextLeftOne theme="outline" size="28" fill="#f5f5f7"/>
            {showControlText&&<div className={'controlButtonText'}>回溯</div>}
        </div>
        <div className="controlButton" onClick={WG_ViewControl.playVocal}>
            <ReplayMusic theme="outline" size="28" fill="#f5f5f7"/>
            {showControlText&&<div className={'controlButtonText'}>重播</div>}
        </div>
        <div className="controlButton" onClick={userInteract.autoNext} id="autoButton">
            <PlayOne theme="outline" size="28" fill="#f5f5f7"/>
            {showControlText&&<div className={'controlButtonText'}>自动</div>}
        </div>
        <div className="controlButton" onClick={userInteract.fastNext} id="fastButton">
            <DoubleRight theme="outline" size="28" fill="#f5f5f7"/>
            {showControlText&&<div className={'controlButtonText'}>快进</div>}
        </div>
        <div className="controlButton" onClick={userInteract.onSaveGame} id="saveButton">
            <FolderDownload theme="outline" size="28" fill="#f5f5f7"/>
            {showControlText&&<div className={'controlButtonText'}>存档</div>}
        </div>
        <div className="controlButton" onClick={userInteract.onLoadGame} id="loadButton">
            <FolderUpload theme="outline" size="28" fill="#f5f5f7"/>
            {showControlText&&<div className={'controlButtonText'}>读档</div>}
        </div>
        <div className="controlButton" onClick={userInteract.onSetting}>
            <SettingTwo theme="outline" size="28" fill="#f5f5f7"/>
            {showControlText&&<div className={'controlButtonText'}>选项</div>}
        </div>
        <div className="controlButton" onClick={userInteract.Title} id="titleButton">
            <Home theme="outline" size="28" fill="#f5f5f7"/>
            {showControlText&&<div className={'controlButtonText'}>标题</div>}
        </div>
    </div>
}
export default ControlBar;