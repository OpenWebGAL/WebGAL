import {userInteract} from "../../Core/InteractController/UserInteract";
import cross from "../../assets/img/cross.svg";
import up from "../../assets/img/up.svg";
import {nextSentenceProcessor} from "../../Core/WG_core";
import ControlBar from "./controlBar";

const BottomBox = () => {
    return <div id="bottomBox">
        <div id="top_control">
                    <span className="top_button" onClick={userInteract.hideTextBox}>
                        <img alt={"cross"} src={cross} style={{width: "22px", height: "22px"}}/>
                    </span>
            {/*<span className="top_button" onClick={userInteract.showBacklog}>*/}
            {/*            <img alt={"up"} src={up} style={{width: "25px", height: "25px"}}/>*/}
            {/*        </span>*/}
        </div>
        <div id="mainTextWindow" onClick={nextSentenceProcessor}>
            <div id="pName"/>
            <div id="SceneText"/>
        </div>
        <ControlBar/>
        <div id={"miniAvatar"} onClick={nextSentenceProcessor}/>
    </div>
}

export default BottomBox;