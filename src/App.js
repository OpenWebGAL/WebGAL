import './App.css';
import Stage from "./Components/Stage/mainStage";
import {
    setAutoWaitTime,autoWaitTime,textShowWaitTime,
    GameInfo,currentScene,auto,fast,onTextPreview,showingText,hideTextStatus,
    currentInfo,Saves,SaveBacklog,CurrentBacklog,currentSavePage,currentLoadPage,Settings,
    loadCookie,writeCookie,clearCookie,loadSettings,getStatus,getScene,getGameInfo,SyncCurrentStatus
} from "./Core/StoreControl/StoreControl"

function App() {
  return (
    <div className="App">
        <Stage/>
    </div>
  );
}

export default App;

