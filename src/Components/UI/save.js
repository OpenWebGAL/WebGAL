import {userInteract} from "../../Core/InteractController/UserInteract";
import closeW from "../../assets/img/closeWhite.svg";

const Save = ()=>{
    return <div id="Save" className="LS_Main">
        <div id="saveMainBox" className="LS_mainBox">
            <div id="closeSave" onClick={userInteract.closeSave}>
                <img src={closeW} className="closeSVG" alt="close"/>
            </div>
            <div id="SaveItems" className="LS_Items">

            </div>
        </div>
    </div>
}

export default Save;