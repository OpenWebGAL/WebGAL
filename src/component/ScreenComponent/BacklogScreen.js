import closeWhite from '../../assets/img/closeWhite.svg'
import '../../assets/css/BacklogScreen.css'
import {connect} from "react-redux";
import {act} from "../../store/Store";
import {uiActions} from "../../store/UiStore";

const mapStateToProps = state => {
    return {
        display: state.uiState.backlogScreen
    }
}

const CurrentBacklog = [
    {showName: "1name", showText: "2text"},
    {showName: "3name", showText: "4text"},
    {showName: "5name", showText: "6text"},
    {showName: "8name", showText: "7text"},
    {showName: "8name", showText: "7text"},
    {showName: "8name", showText: "7text"},
    {showName: "8name", showText: "7text"},
    {showName: "8name", showText: "7text"},
    {showName: "8name", showText: "7text"},
    {showName: "8name", showText: "7text"},
    {showName: "8name", showText: "7text"}
]

function BacklogScreen(props) {

    function backlogClick(index) {
        act(actions.HANDLE_BACKLOG_SELECTED, index)
    }

    function closeBacklog() {
        act(uiActions.SET_BACKLOG_SCREEN, false)
    }


    let showBacklogList = [];
    for (let i = 0; i < CurrentBacklog.length; i++) {
        showBacklogList.push(<div className='backlog_singleElement' key={i} onClick={() => backlogClick(i)}>
            <div className="backlog_name">{CurrentBacklog[i].showName}</div>
            <div className="backlog_text">{CurrentBacklog[i].showText}</div>
        </div>)
    }

    return (
        <div id="backlog" style={{'display': props.display ? 'block' : 'none'}}>
            <div id="closeBl" onClick={closeBacklog}>
                <img src={closeWhite} className="closeSVG" alt="close"/>
            </div>
            <div id="backlogContent">
                {showBacklogList}
            </div>
        </div>
    )
}

export default connect(mapStateToProps)(BacklogScreen)