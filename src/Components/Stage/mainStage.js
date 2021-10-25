// import '../../assests/css/main.css';
// import '../../assests/css/panic.css'
// import '../../assests/css/window.css'
// import '../../assests/css/Load_Save.css'
// import '../../assests/css/settings.css'
// import "../../assests/css/UI_component.css"
// import '../../Core/StoreControl/StoreControl'
import {setAutoWaitTime,autoWaitTime,textShowWatiTime,
    GameInfo,currentScene,auto,fast,onTextPreview,showingText,hideTextStatus,
    currentInfo,Saves,SaveBacklog,CurrentBacklog,currentSavePage,currentLoadPage,Settings,
    loadCookie,writeCookie,clearCookie,loadSettings,getStatus,getScene,getGameInfo}
    from "../../Core/StoreControl/StoreControl";
import {userInteract} from "../../Core/InteractController/UserInteract";
import {nextSentenceProcessor,increaseSentence} from "../../Core/WG_core";
import {WG_ViewControl} from "../../Core/ViewController/ViewControl";
import closeB from "../../assests/img/closeBlack.svg"
import closeW from "../../assests/img/closeWhite.svg"
import up from "../../assests/img/up.svg";
import cross from "../../assests/img/cross.svg";
import '@icon-park/react/styles/index.css';
import {
    DoubleRight,
    FolderDownload,
    FolderUpload,
    Home,
    PlayOne,
    ReplayMusic,
    Save,
    SettingTwo
} from "@icon-park/react";
import {isMobile} from "../../Core/util/WG_util";

// window.onload = function () {
//     loadCookie();
//     loadSettings();
//     getGameInfo();
//     WG_ViewControl.loadBGM();
//
// }

function Stage() {
    return (
        <div className="Stage">
            <div id="intro" className="intro_styl"/>
            <div id="MesModel"/>
            <div id="Title">
                <div id="TitleModel">
                    <div id="setButtonBottom">
                        <div className="TitleSingleButton" id="leftTitleButton" onClick={userInteract.hideTitle}>START</div>
                        <div className="TitleSingleButton" onClick={userInteract.continueGame}>CONTINUE</div>
                        <div className="TitleSingleButton" onClick={userInteract.onLoadGame}>LOAD</div>
                        <div className="TitleSingleButton" onClick={userInteract.onSetting}>CONFIG</div>
                        <div className="TitleSingleButton" onClick={userInteract.exit}>EXIT</div>
                    </div>

                </div>
            </div>
            <div id="mainBackground" onClick={userInteract.clickOnBack}>
            </div>
            <div id="figureImage" onClick={userInteract.clickOnBack}/>
            <div id="figureImage_left" onClick={userInteract.clickOnBack}/>
            <div id="figureImage_right" onClick={userInteract.clickOnBack}/>
            <div id="settings">
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
            <div id="backlog">
                <div id="closeBl" onClick={userInteract.closeBacklog}>
                    <img src={closeW} className="closeSVG" alt="close"/>
                </div>
                <div id="backlogContent"/>
            </div>
            <div id="Load" className="LS_Main">
                <div id="loadMainBox" className="LS_mainBox">
                    <div id="closeLoad" onClick={userInteract.closeLoad}>
                        <img src={closeB} className="closeSVG" id="LoadClose" alt="close"/>
                    </div>
                    <div id="LoadTitle">
                        读档
                    </div>
                    <div id="LoadItems" className="LS_Items">
                    </div>
                </div>
            </div>
            <div id="Save" className="LS_Main">
                <div id="saveMainBox" className="LS_mainBox">
                    <div id="closeSave" onClick={userInteract.closeSave}>
                        <img src={closeB} className="closeSVG" alt="close"/>
                    </div>
                    <div id="SaveTitle">
                        存档
                    </div>
                    <div id="SaveItems" className="LS_Items">

                    </div>
                </div>
            </div>
            <div id="chooseBox"/>
            <div id="bottomBox">
                <div id="top_control">
                    <span className="top_button" onClick={userInteract.hideTextBox}>
                        <img src={cross} style={{width: "22px",height: "22px"}}/>
                    </span>
                    <span className="top_button" onClick={userInteract.showBacklog}>
                        <img src={up} style={{width: "25px",height: "25px"}}/>
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
            </div>
            <div id="bgm"/>
            <div id="vocal"/>
            <div id="panic-overlay"/>
        </div>
    );
}

export default Stage;