import './SaveScreen.css'
import closeBlack from '../../assets/img/closeBlack.svg'
import {connect} from "react-redux";
import store, {act, actions} from "../../store/store";
import ListContent from "../ListContent/ListContent";
import AlertDialog from "../AlertDialog/AlertDialog";

const mapStateToProps = state => {
    return {
        display: state.saveScreen.display,
        saves: state.saves
    }
}

function SaveScreen(props) {

    function closeSave() {
        act(actions.HIDE_SAVE_SCREEN)
    }

    function checkDisplay() {
        return {'display': props.display ? 'block' : 'none'}
    }

    function onSaveOnEmpty(index) {
        console.log("onSaveOnEmpty", index)
        act(actions.ADD_SAVES, store.getState()['runtime'], index)
    }

    function onSaveOnNonEmpty(index) {
        AlertDialog?.open({
            title: "是否覆盖此存档？",
            left: {
                text: "确认",
                callback: () => act(actions.ADD_SAVES, index)
            },
            right: {
                text: "取消",
            }
        })
        console.log("onSaveOnNonEmpty", index)
    }

    return (
        <div id="Save" style={checkDisplay()}>
            <div id="saveMainBox">
                <div id="closeSave" onClick={closeSave}>
                    <img src={closeBlack} className="closeSVG" alt="close"/>
                </div>
                <div id="SaveTitle">存档</div>
                <div id="SaveItems">
                    <ListContent data={props.saves} LoadPageQty={10}
                                 onClickEmpty={onSaveOnEmpty}
                                 onClickNonEmpty={onSaveOnNonEmpty}/>
                </div>
            </div>
        </div>
    )
}

export default connect(mapStateToProps)(SaveScreen)