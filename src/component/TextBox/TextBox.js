import './TextBox.css'
import {connect} from "react-redux";
import {act, actions} from "../../store/store";
import GamePlay from "../../core/GamePlay";
import {useEffect, useState} from "react";
import DynamicEffectUtil from "../../utils/DynamicEffectUtil";

const mapStateToProps = state => {
    return {
        display: state.textBox.display,
        showName: state.runtime.showName,
        showText: state.runtime.showText
    }
}

function TextBox(props) {
    const [textAnimateInterval, setTextAnimateInterval] = useState()

    useEffect(() => {
        if (textAnimateInterval !== null) clearInterval(textAnimateInterval)

        setTextAnimateInterval(
            DynamicEffectUtil.showTextArray(props.showText, document.getElementById("SceneText"))
        )
    }, [props.showText])

    function hideTextBox() {
        act(actions.HIDE_TEXT_BOX)
    }

    function showBacklog() {
        act(actions.SHOW_BACKLOG_SCREEN)
    }

    function nextSentenceProcessor() {
        GamePlay.nextSentenceProcessor()
    }

    function playVocal() {

    }

    function autoNext() {

    }

    function fastNext() {

    }

    function ToSaveScreen() {
        act(actions.SHOW_SAVE_SCREEN)
    }

    function ToLoadScreen() {
        act(actions.SHOW_LOAD_SCREEN)
    }

    function ToSettingsScreen() {
        act(actions.SHOW_SETTINGS_SCREEN)
    }

    function ToTitleScreen() {
        act(actions.SHOW_TITLE_SCREEN)
        act(actions.HIDE_TEXT_BOX)
    }

    return (
        <div id="bottomBox" style={{'display': props.display ? 'flex' : 'none'}}>
            <div id="top_control">
                <span className="top_button" onClick={hideTextBox}>隐藏</span>
                <span className="top_button" onClick={showBacklog}>回溯</span>
            </div>
            <div id="mainTextWindow" onClick={nextSentenceProcessor}>
                <div id="pName">
                    <span>{props.showName}</span>
                </div>
                <div id="SceneText"/>
            </div>
            <div id="controlBar">
                <div className="controlButton" onClick={playVocal}>重播</div>
                <div className="controlButton" onClick={autoNext} id="autoButton">自动</div>
                <div className="controlButton" onClick={fastNext} id="fastButton">快进</div>
                <div className="controlButton" onClick={ToSaveScreen} id="saveButton">存档</div>
                <div className="controlButton" onClick={ToLoadScreen} id="loadButton">读档</div>
                <div className="controlButton" onClick={ToSettingsScreen}>设置</div>
                <div className="controlButton" onClick={ToTitleScreen} id="titleButton">标题</div>
            </div>
        </div>
    )
}

export default connect(mapStateToProps)(TextBox)