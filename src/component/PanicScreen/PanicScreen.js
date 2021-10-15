import './PanicScreen.css'
import {connect} from "react-redux";

const mapStateToProps = state => {
    return {
        display: state.panicScreen.display
    }
}

function PanicScreen(props) {

    function checkDisplay() {
        return {'display': props.display ? 'block' : 'none'}
    }

    return (
        <div id="panic-overlay" style={checkDisplay()}>
            <div className="yoozle-container">
                <div className="yoozle-title">
                    <span>
                        <span className="yoozle-gl-blue">Y</span><span className="yoozle-gl-red">o</span><span
                        className="yoozle-gl-yellow">o</span><span className="yoozle-gl-blue">z</span><span
                        className="yoozle-gl-green">l</span><span className="yoozle-gl-red yoozle-e-rotate">e</span>
                    </span>
                </div>
                <div className="yoozle-search">
                    <input className="yoozle-search-bar" type="text" defaultValue=""/>
                    <div className="yoozle-search-buttons">
                        <input className="yoozle-btn" type="submit" value="Yoozle Search"/>
                        <input className="yoozle-btn" type="submit" value="I'm Feeling Lucky"/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default connect(mapStateToProps)(PanicScreen)