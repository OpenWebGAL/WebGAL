import './TitleScreen.css'
import {act, actions} from '../../store/store'
import {connect} from "react-redux";
import AlertDialog from "../AlertDialog/AlertDialog";
import GamePlay from "../../core/GamePlay";

const mapStateToProps = state => {
    return {
        display: state.titleScreen.display,
        titleBgUrl: state.titleScreen.titleBgUrl
    }
}

function TitleScreen(props) {

    function hideTitle() {
        GamePlay.getScene("game/scene/start.txt")
        act(actions.HIDE_TITLE_SCREEN)
    }

    function continueGame() {
        act(actions.HIDE_TITLE_SCREEN, null)
    }

    function onLoadGame() {
        act(actions.SHOW_LOAD_SCREEN)
    }

    function onSetting() {
        act(actions.SHOW_SETTINGS_SCREEN, null)
    }

    function exit() {
        AlertDialog?.open({
            title: "确认退出？",
            left: {
                text: "确认",
                callback: () => {
                    act(actions.CLEAR_RUNTIME)
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
                    <div className="TitleSingleButton" id="leftTitleButton" onClick={hideTitle}>开始游戏</div>
                    <div className="TitleSingleButton" onClick={continueGame}>继续游戏</div>
                    <div className="TitleSingleButton" onClick={onLoadGame}>读取存档</div>
                    <div className="TitleSingleButton" onClick={onSetting}>设置界面</div>
                    <div className="TitleSingleButton" onClick={exit}>退出游戏</div>
                </div>
            </div>
        </div>
    )
}


export default connect(mapStateToProps)(TitleScreen)