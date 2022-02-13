import {userInteract} from "../../Core/InteractController/UserInteract";

const Title = ()=>{
    return <div id="Title">
        <div id="TitleModel">
            <div id="setButtonBottom">
                <div className="TitleSingleButton" onClick={userInteract.hideTitle}>
                    <div className={'TitleButtonENG'}>START</div>
                    <div className={'TitleButtonCHN'}>从头开始</div>
                </div>
                <div className="TitleSingleButton" onClick={userInteract.continueGame}>
                    <div className={'TitleButtonENG'}>CONTINUE</div>
                    <div className={'TitleButtonCHN'}>继续游戏</div>
                </div>
                <div className="TitleSingleButton" onClick={userInteract.onLoadGame}>
                    <div className={'TitleButtonENG'}>LOAD</div>
                    <div className={'TitleButtonCHN'}>读取游戏</div>
                </div>
                <div className="TitleSingleButton" onClick={userInteract.onSetting}>
                    <div className={'TitleButtonENG'}>CONFIG</div>
                    <div className={'TitleButtonCHN'}>偏好设置</div>
                </div>
                <div className="TitleSingleButton" onClick={userInteract.exit}>
                    <div className={'TitleButtonENG'}>EXIT</div>
                    <div className={'TitleButtonCHN'}>结束游戏</div>
                </div>
            </div>
        </div>
    </div>
}

export default Title;