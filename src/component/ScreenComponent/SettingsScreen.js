import SettingsButtonSelector from "../ChildComponent/SettingsButtonSelector";

import '../../assets/css/SettingsScreen.css'
import closeBlack from '../../assets/img/closeBlack.svg'
import {act, actions} from "../../store/store";
import {connect} from "react-redux";
import AlertDialog from "../FunctionalComponent/AlertDialog";

const mapStateToProps = state => {
    return {
        display: state.settingsScreen.display,
        fontSize: state.settingsScreen.fontSize,
        playSpeed: state.settingsScreen.playSpeed
    }
}

function SettingsScreen(props) {

    function closeSettings() {
        act(actions.TOGGLE_SETTINGS_SCREEN)
    }

    function onSelectFontSize(index) {
        act(actions.FONT_SIZE_SELECTION, index)
        console.log("font_size:" + index)
    }

    function onSelectPlaySpeed(index) {
        act(actions.PLAY_SPEED_SELECTION, index)
        console.log("speed:" + index)
    }

    function onClearAllData() {
        AlertDialog?.open({
            title: "你确定要清除缓存吗?",
            left: {
                text: "要",
                callback: () => {
                    act(actions.CLEAR_SAVES)
                    act(actions.CLEAR_RUNTIME)
                }
            },
            right: {
                text: "不要"
            },
        })
    }

    function checkDisplay() {
        return {'display': props.display ? 'block' : 'none'}
    }

    function checkFontSizeSelectionIndex() {
        return actions.FONT_SIZE_SELECTION.indexOf(props.fontSize)
    }

    function checkPlaySpeedSelectionIndex() {
        return actions.PLAY_SPEED_SELECTION.indexOf(props.playSpeed)
    }

    return (
        <div id="SettingsPanel" style={checkDisplay()}>
            <div id="settingsMainBox">
                <div id="close" onClick={() => closeSettings()}>
                    <img src={closeBlack} className="closeSVG" alt="close"/>
                </div>
                <div id="settingsTitle">设置</div>
                <div id="settingItems">
                    <div className="singleSettingItem">
                        <SettingsButtonSelector onSelect={onSelectFontSize} select={checkFontSizeSelectionIndex()}
                                                title={'字体大小'} selection={['小', '中', '大']}/>
                        <SettingsButtonSelector onSelect={onSelectPlaySpeed} select={checkPlaySpeedSelectionIndex()}
                                                title={'播放速度'} selection={['慢', '中', '快']}/>
                        <div className={"deleteCookie"} onClick={onClearAllData}>清除所有设置选项以及存档
                        </div>
                        <div>本作品由 WebGAL 强力驱动，<a href={"https://github.com/MakinoharaShoko/WebGAL"}>了解 WebGAL</a>。
                        </div>
                        <br/>
                        <div className='settingItemTitle'>效果预览</div>
                    </div>
                </div>
                <div id="textPreview"/>
            </div>
        </div>
    );
}

export default connect(mapStateToProps)(SettingsScreen);