import {userInteract} from "../../Core/InteractController/UserInteract";

const StartPage = ()=>{
    return <div id={"WG_startPage"} onClick={() => {
        userInteract.hideStartPage()
    }}>
        {/*点击屏幕以继续*/}
    </div>
}

export default StartPage;