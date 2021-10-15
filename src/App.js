import './App.css';
import SettingsPanel from "./component/SettingsScreen/SettingsScreen";
import TextBox from "./component/TextBox/TextBox";
import TitleScreen from "./component/TitleScreen/TitleScreen";
import PanicOverlay from "./component/PanicScreen/PanicScreen";
import BacklogScreen from "./component/BacklogScreen/BacklogScreen";
import SaveScreen from "./component/SaveScreen/SaveScreen";
import LoadScreen from "./component/LoadScreen/LoadScreen";

function App() {

    function clickBackGround() {
        console.log("clickOnBack")
    }

    return (
        <div className="App">
            <div id="mainBackground" onClick={clickBackGround}/>
            <LoadScreen/>
            <SaveScreen/>
            <BacklogScreen/>
            <TitleScreen/> {/* #Title */}
            <SettingsPanel/> {/* #settings */}
            <TextBox/> {/* #bottomBox */}
            <PanicOverlay/>
        </div>
    );
}

export default App;
