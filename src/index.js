import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {
    setAutoWaitTime,autoWaitTime,textShowWaitTime,
    GameInfo,currentScene,auto,fast,onTextPreview,showingText,hideTextStatus,
    currentInfo,Saves,SaveBacklog,CurrentBacklog,currentSavePage,currentLoadPage,Settings,
    loadCookie,writeCookie,clearCookie,loadSettings,getStatus,getScene,getGameInfo,SyncCurrentStatus
} from "./Core/StoreControl/StoreControl"
import {WG_ViewControl} from "./Core/ViewController/ViewControl";
import {isMobile, MobileChangeStyle} from "./Core/util/WG_util";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('ReactRoot')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

loadCookie();
loadSettings();
getGameInfo();
WG_ViewControl.loadBGM();
if(isMobile()){
    MobileChangeStyle();
}