import '../../assets/css/TitleScreen.css'
import Store, {act} from '../../store/Store'
import {connect} from "react-redux";
import AlertDialog from "../FunctionalComponent/AlertDialog";
import GamePlay from "../../core/GamePlay";
import {uiActions} from "../../store/UiStore";
import {cActions} from "../../store/CurrentInfoStore";

const mapStateToProps = state => {
    return {
        display: state.uiState.titleScreen,
        titleBgUrl: state.runtime.bg_Name // todo
    }
}

function TitleScreen(props) {

    let defaultEntry = "game/scene/start.txt"

    function startGame() {
        act(cActions.CLEAR_RUNTIME)
        GamePlay.getScene(defaultEntry).then(() => {
            GamePlay.sentenceProcessor(0)
            act(uiActions.SET_TITLE_SCREEN, false)
            act(uiActions.SET_TEXT_BOX, true)
        })
    }

    function continueGame() {
        GamePlay.getScene(Store.getState()["runtime"].SceneName || defaultEntry).then(() => {
            act(uiActions.SET_TITLE_SCREEN, false)
            act(uiActions.SET_TEXT_BOX, true)
        })
    }

    function ToLoadScreen() {
        act(uiActions.SET_LOAD_SCREEN, true)
    }

    function ToSettingsScreen() {
        act(uiActions.SET_SETTINGS_SCREEN, true)
    }

    function exit() {
        AlertDialog?.open({
            title: "确认退出？",
            left: {
                text: "确认",
                callback: () => {
                    act(cActions.CLEAR_RUNTIME)
                }
            },
            right: {
                text: "取消"
            }
        })
    }

    function checkDisplay() {
        return {
            display: props.display ? 'block' : 'none',
            backgroundImage: `url(${props?.titleBgUrl})`
        }
    }

    return (
        <div id="TitlePage" style={checkDisplay()}>
            <div id="TitleModel">
                <div id="setButtonBottom">
                    <div className="TitleSingleButton" id="leftTitleButton" onClick={startGame}>开始游戏</div>
                    <div className="TitleSingleButton" onClick={continueGame}>继续游戏</div>
                    <div className="TitleSingleButton" onClick={ToLoadScreen}>读取存档</div>
                    <div className="TitleSingleButton" onClick={ToSettingsScreen}>设置界面</div>
                    <div className="TitleSingleButton" onClick={exit}>退出游戏</div>
                </div>
            </div>
        </div>
    )
}


export default connect(mapStateToProps)(TitleScreen)