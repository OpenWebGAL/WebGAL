import './LoadScreen.css'
import closeBlack from '../../assets/img/closeBlack.svg'
import {act, actions} from "../../store/store";
import {connect} from "react-redux";
import ListContent from "../ListContent/ListContent";
import GamePlay from "../../core/GamePlay";

const mapStateToProps = state => {
    return {
        display: state.loadScreen.display,
        saves: state.saves
    }
}

function LoadScreen(props) {
    function closeLoad() {
        act(actions.HIDE_LOAD_SCREEN)
    }

    function checkDisplay() {
        return {'display': props.display ? 'block' : 'none'}
    }

    function onLoad(index) {
        GamePlay.loadSavedGame(index)
    }

    return (
        <div id="Load" style={checkDisplay()}>
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