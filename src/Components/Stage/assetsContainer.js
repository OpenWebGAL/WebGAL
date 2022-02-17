import {WG_ViewControl} from "../../Core/ViewController/ViewControl";
import {userInteract} from "../../Core/InteractController/UserInteract";

const AssetsContainer = () => {
    return <>
        <div id="intro" className="intro_styl"/>
        <div id={"videoContainer"} className={"videoContainer_styl"} onClick={WG_ViewControl.closeVideo}/>
        <div id="MesModel"/>
        <div id="BackgroundContainer">
            <div id={'oldBG'}/>
            <div id={'mainBackground'}/>
        </div>
        <div id="figureImage" className={"figureContainercenter"}/>
        <div id="figureImage_left" className={"figureContainerleft"}/>
        <div id="figureImage_right" className={"figureContainerright"}/>
        <div id={'pixiContianer'}/>
        <div id="chooseBox"/>
        <div id="bgm"/>
        <div id="vocal"/>
        <div id="panic-overlay"/>
        <div id={'clickOnBackHandler'} onClick={userInteract.clickOnBack}/>
    </>
}

export default AssetsContainer;