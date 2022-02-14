import {WG_ViewControl} from "../../Core/ViewController/ViewControl";
import {userInteract} from "../../Core/InteractController/UserInteract";

const AssetsContainer = ()=>{
    return <>
        <div id="intro" className="intro_styl"/>
        <div id={"videoContainer"} className={"videoContainer_styl"} onClick={WG_ViewControl.closeVideo}/>
        <div id="MesModel"/>
        <div id="BackgroundContainer" onClick={userInteract.clickOnBack}>
            <div id={'oldBG'}/>
            <div id={'mainBackground'}/>
        </div>
        <div id="figureImage" className={"figureContainercenter"} onClick={userInteract.clickOnBack}/>
        <div id="figureImage_left" className={"figureContainerleft"} onClick={userInteract.clickOnBack}/>
        <div id="figureImage_right" className={"figureContainerright"} onClick={userInteract.clickOnBack}/>
        <div id={'pixiContianer'}/>
        <div id="chooseBox"/>
        <div id="bgm"/>
        <div id="vocal"/>
        <div id="panic-overlay"/>
    </>
}

export default AssetsContainer;