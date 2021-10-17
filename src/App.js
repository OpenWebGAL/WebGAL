import './App.css';
import SettingsPanel from "./component/ScreenComponent/SettingsScreen";
import TextBox from "./component/ScreenComponent/TextBox";
import TitleScreen from "./component/ScreenComponent/TitleScreen";
import PanicOverlay from "./component/ScreenComponent/PanicScreen";
import BacklogScreen from "./component/ScreenComponent/BacklogScreen";
import SaveScreen from "./component/ScreenComponent/SaveScreen";
import LoadScreen from "./component/ScreenComponent/LoadScreen";
import {connect} from "react-redux";
import GamePlay from "./core/GamePlay";

const mapStateToProps = state => {
    return {
        gameplay_bg: state.runtime.bg_Name
    }
}

function App(props) {

    const clickBackGround = () => GamePlay.nextSentenceProcessor()

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
