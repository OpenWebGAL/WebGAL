import './App.css';
import SettingsPanel from "./component/SettingsScreen/SettingsScreen";
import TextBox from "./component/TextBox/TextBox";
import TitleScreen from "./component/TitleScreen/TitleScreen";
import PanicOverlay from "./component/PanicScreen/PanicScreen";
import BacklogScreen from "./component/BacklogScreen/BacklogScreen";
import SaveScreen from "./component/SaveScreen/SaveScreen";
import LoadScreen from "./component/LoadScreen/LoadScreen";
import {connect} from "react-redux";
import GamePlay from "./core/GamePlay";

const mapStateToProps = state => {
    return {
        gameplay_bg: state.runtime.bg_Name
    }
}

function App(props) {

    function clickBackGround() {
        GamePlay.nextSentenceProcessor()
        console.log("clickOnBack")
    }

    return (
        <div className="App">
            <div id="mainBackground" onClick={clickBackGround}
                 style={{backgroundImage: `url(/game/background/${props.gameplay_bg})`}}/>
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

export default connect(mapStateToProps)(App);
