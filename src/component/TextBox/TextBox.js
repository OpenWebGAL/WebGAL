import './TextBox.css'
import {connect} from "react-redux";
import {act, actions} from "../../store/store";

const mapStateToProps = state => {
    return {
        display: state.textBox.display
    }
}

function TextBox(props) {

    function checkDisplay() {
        return {'display': props.display ? 'flex' : 'none'}
    }

    function hideTextBox() {
        act(actions.HIDE_TEXT_BOX)
    }

    function showBacklog() {
        act(actions.SHOW_BACKLOG_SCREEN)
    }

    function nextSentenceProcessor() {

    }

    function playVocal() {

    }

    function autoNext() {

    }

    function fastNext() {

    }

    function onSaveGame() {
        act(actions.SHOW_SAVE_SCREEN)
    }

    function onLoadGame() {
        act(actions.SHOW_LOAD_SCREEN)
    }

    function onSetting() {
        act(actions.SHOW_SETTINGS_SCREEN)
    }

    function Title() {
        act(actions.SHOW_TITLE_SCREEN)
        act(actions.HIDE_TEXT_BOX)
    }

    return (
        <div id="bottomBox" style={checkDisplay()}>
            <div id="top_control">
                <span className="top_button" onClick={() => hideTextBox()}>隐藏</span>
                <span className="top_button" onClick={showBacklog}>回溯</span>
            </div>
            <div id="mainTextWindow" onClick={nextSentenceProcessor}>
                <div id="pName"/>
                <div id="SceneText"/>
            </div>
            <div id="controlBar">
                <div className="controlButton" onClick={playVocal}>重播</div>
                <div className="controlButton" onClick={autoNext} id="autoButton">自动</div>
                <div className="controlButton" onClick={fastNext} id="fastButton">快进</div>
                <div className="controlButton" onClick={onSaveGame} id="saveButton">存档</div>
                <div className="controlButton" onClick={onLoadGame} id="loadButton">读档</div>
                <div className="controlButton" onClick={onSetting}>设置</div>
                <div className="controlButton" onClick={Title} id="titleButton">标题</div>
            </div>
        </div>
    )
}

export default connect(mapStateToProps)(TextBox)