import SettingsButtonSelector from "../ChildComponent/SettingsButtonSelector";
import '../../assets/css/SettingsScreen.css'
import closeBlack from '../../assets/img/closeBlack.svg'
import {act, actions} from "../../store/Store";
import {connect} from "react-redux";
import AlertDialog from "../FunctionalComponent/AlertDialog";
import {uiActions} from "../../store/UiStore";
import {cActions} from "../../store/CurrentInfoStore";

const mapStateToProps = state => {
    return {
        display: state.uiState.settingsScreen,
        fontSize: state.settings.fontSize,
        playSpeed: state.settings.playSpeed
    }
}

function SettingsScreen(props) {

    function closeSettings() {
        act(uiActions.SET_SETTINGS_SCREEN, false)
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
                    act(cActions.CLEAR_RUNTIME)
                }
            },
            right: {
                text: "不要"
            },
        })
    }

    function checkFontSizeSelectionIndex() {
        return actions.FONT_SIZE_SELECTION.indexOf(props.fontSize)
    }

    function checkPlaySpeedSelectionIndex() {
        return actions.PLAY_SPEED_SELECTION.indexOf(props.playSpeed)
    }

    return (
        <div id="SettingsPanel" style={{'display': props.display ? 'block' : 'none'}}>
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