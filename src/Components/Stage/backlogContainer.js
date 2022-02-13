import {userInteract} from "../../Core/InteractController/UserInteract";
import closeW from "../../assets/img/closeWhite.svg";

const BacklogContainer = ()=>{
    return <div id="backlog">
        <div id="closeBl" onClick={userInteract.closeBacklog}>
            <img src={closeW} className="closeSVG" alt="close"/>
        </div>
        <div id="backlogContent"/>
    </div>
}

export default BacklogContainer;