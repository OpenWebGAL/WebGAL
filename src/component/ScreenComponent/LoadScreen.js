import '../../assets/css/LoadScreen.css'
import closeBlack from '../../assets/img/closeBlack.svg'
import {act} from "../../store/Store";
import {connect} from "react-redux";
import ListContent from "../ChildComponent/ListContent";
import GamePlay from "../../core/GamePlay";
import {uiActions} from "../../store/UiStore";

const mapStateToProps = state => {
    return {
        display: state.uiState.loadScreen,
        saves: state.saves
    }
}

function LoadScreen(props) {
    function closeLoad() {
        act(uiActions.SET_LOAD_SCREEN, false)
    }

    function onLoad(index) {
        GamePlay.loadSavedGame(index)
    }

    return (
        <div id="Load" style={{'display': props.display ? 'block' : 'none'}}>
            <div id="loadMainBox">
                <div id="closeLoad" onClick={closeLoad}>
                    <img src={closeBlack} className="closeSVG" id="LoadClose" alt="close"/>
                </div>
                <div id="LoadTitle">读档</div>
                <div id="LoadItems">
                    <ListContent data={props?.saves} themeColor={"#005CAF"} onClickNonEmpty={onLoad}/>
                </div>
            </div>
        </div>
    )
}

export default connect(mapStateToProps)(LoadScreen)