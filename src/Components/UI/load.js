import {userInteract} from "../../Core/InteractController/UserInteract";
import closeW from "../../assets/img/closeWhite.svg";

const Load = ()=>{
    return <div id="Load" className="LS_Main">
        <div id="loadMainBox" className="LS_mainBox">
            <div id="closeLoad" onClick={userInteract.closeLoad}>
                <img src={closeW} className="closeSVG" id="LoadClose" alt="close"/>
            </div>
            <div id="LoadItems" className="LS_Items">
            </div>
        </div>
    </div>
}

export default Load;