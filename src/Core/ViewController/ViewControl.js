import ReactDOM from "react-dom";
import {currentPIXI, getRuntime, getStatus} from "../StoreControl/StoreControl";
import * as PIXI from 'pixi.js';
import {userInteract} from "../InteractController/UserInteract";
import {
    LoadMainModel, SaveMainModel
} from "../../Components/UI/etc";
import {nextSentenceProcessor} from "../WG_core";
import React from "react";
import '@icon-park/react/styles/index.css';
import Figure from "../../Components/Stage/figure";
import ChooseBox from "../../Components/UI/chooseBox";
import restoreStatus from "./functions/restoreStatus";
import SettingsModel from "../../Components/UI/settingsModel";
import changeBG from "./functions/changeBG";
import loadBGM from "./functions/loadBGM";
import BackLog from "../../Components/UI/backLog";
import Yoozle from "../../Components/UI/yoozle";
import showTextPreview from "./functions/showTextPreview";
import showTextArary from "./functions/showTextArray";
import MessageModel from "../../Components/UI/messageModel";

class WG_ViewControl {

    static VC_PIXI_Create() {
        let app = new PIXI.Application({
            // width: 256,
            // height: 256,
            // backgroundColor:'ox1099bb',
            transparent: true
        });
        //Add the canvas that Pixi automatically created for you to the HTML document
        //清空原节点
        document.getElementById('pixiContianer').innerHTML = '';
        document.getElementById('pixiContianer').appendChild(app.view);
        app.renderer.view.style.position = "absolute";
        app.renderer.view.style.display = "block";
        app.renderer.autoResize = true;
        app.renderer.resize(document.getElementById('ReactRoot').clientWidth, document.getElementById('ReactRoot').clientHeight);
        app.renderer.view.style.zIndex = '2';
        currentPIXI['app'] = app;
        const container = new PIXI.Container();
        app.stage.addChild(container);
        const texture = PIXI.Texture.from('./game/tex/rain_min.png');
        // 创建5x5兔子网格
        for (let i = 0; i < 25; i++) {
            const bunny = new PIXI.Sprite(texture);
            bunny.anchor.set(0.5);
            bunny.x = (i % 5) * 300;
            bunny.y = Math.floor(i / 5) * 300;
            container.addChild(bunny);
        }
        // 将容器移到中心
        container.x = app.screen.width / 2;
        container.y = app.screen.height / 2;
        // 本地container坐标系中的兔子雪碧中心
        container.pivot.x = container.width / 2;
        container.pivot.y = container.height / 2;
        // 监听动画更新
        app.ticker.add((delta) => {
            // 下降容器！
            // 使用delta创建与帧无关的转换
            container.y += 5 * delta;
            if (container.y >= 800) {
                container.y = 0;
            }
        });
    }

    static VC_changeBG(bg_name) {
        changeBG(bg_name);
    }

    static VC_changeP(P_name, pos) {
        const changedP = <Figure P_name={P_name}/>;
        switch (pos) {
            case 'center':
                ReactDOM.render(changedP, document.getElementById('figureImage'));
                getRuntime().currentInfo["fig_Name"] = P_name;
                break;
            case 'left':
                ReactDOM.render(changedP, document.getElementById('figureImage_left'));
                getRuntime().currentInfo["fig_Name_left"] = P_name;
                break;
            case 'right':
                ReactDOM.render(changedP, document.getElementById('figureImage_right'));
                getRuntime().currentInfo["fig_Name_right"] = P_name;
                break;
            default:
                console.log('立绘位置参数错误');
                break;
        }
    }

    static VC_choose(selection, mode) {
        document.getElementById('chooseBox').style.display = 'flex';
        const Choose = <ChooseBox mode={mode} selection={selection}/>
        ReactDOM.render(Choose, document.getElementById('chooseBox'));
    }

    static VC_closeChoose() {
        document.getElementById('chooseBox').style.display = 'none';
    }

    static VC_textShow(name, text) {
        let changedName = <span>{name}</span>
        let textArray = text.split("");
        ReactDOM.render(changedName, document.getElementById('pName'));
        WG_ViewControl.showTextArray(textArray);
    }

    static VC_setBGtransform(transform) {
        document.getElementById('mainBackground').style.transform = transform;
    }

    static VC_setBGfilter(filter) {
        document.getElementById('mainBackground').style.filter = filter;
    }

    static VC_restoreStatus(savedStatus) {
        restoreStatus(savedStatus);
    }

    static VC_showSettings() {
        let settingInterface = <SettingsModel/>
        document.getElementById("settings").style.display = "flex";
        document.getElementById("bottomBox").style.display = "none";
        ReactDOM.render(settingInterface, document.getElementById("settingItems"));
        ReactDOM.render(<div id="previewDiv"/>, document.getElementById('textPreview'));
        WG_ViewControl.showTextPreview('现在预览的是文本框字体大小和播放速度的情况，您可以根据您的观感调整上面的选项。');
    }

    static VC_showSave_Load(mode) {
        if (mode === 'save') {
            ReactDOM.render(<SaveMainModel PageQty={15}/>, document.getElementById('SaveItems'))
        } else {
            ReactDOM.render(<LoadMainModel PageQty={15}/>, document.getElementById('LoadItems'))
        }
    }

    static VC_resetStage() {
        // document.getElementById('mainBackground').style.backgroundImage = 'none';
        ReactDOM.render(<div/>, document.getElementById('figureImage'));
        ReactDOM.render(<div/>, document.getElementById('figureImage_left'));
        ReactDOM.render(<div/>, document.getElementById('figureImage_right'));
    }

    static loadBGM() {
        loadBGM();
    }

    static playVocal() {
        console.log("Playing vocal:")
        let runtimeTemp = getStatus("all")
        if (document.getElementById('currentVocal')) {
            document.getElementById('currentVocal').pause();
        }
        let vocalName = runtimeTemp.vocal;
        if (vocalName === '') {
            ReactDOM.render(<div/>, document.getElementById('vocal'));
            return;
        }
        let url = './game/vocal/' + vocalName;
        let vocal = <audio src={url} id={"currentVocal"}/>
        ReactDOM.render(vocal, document.getElementById('vocal'), () => {
            let VocalControl = document.getElementById("currentVocal");
            VocalControl.currentTime = 0;
            VocalControl.oncanplay = function () {
                VocalControl.play();
            }
        });
    }

    static showIntro(text) {
        let i = 0;
        let IntroView = <div>
            <div id={"textShowArea"} className={"textShowArea_styl"}>
            </div>
        </div>;
        ReactDOM.render(IntroView, document.getElementById("intro"));
        ReactDOM.render(<div>{" "}</div>, document.getElementById("textShowArea"));
        document.getElementById("intro").style.display = 'block';
        let textArray = text.split(',');
        let introInterval = setInterval(textShow, 1500);
        let introAll = [];

        function textShow() {
            let singleRow = <div className={"introSingleRow"} key={i}>{textArray[i]}</div>;
            introAll.push(singleRow);
            i = i + 1;
            ReactDOM.render(<div>{introAll}</div>, document.getElementById("textShowArea"));
            if (i >= textArray.length) {
                clearInterval(introInterval);
                setTimeout(userInteract.clearIntro, 3500);
            }
        }
    }

    static showVideo(videoName) {
        let videoTag = <video autoPlay={true} id={"video_show"} src={`./game/video/${videoName}`}/>
        ReactDOM.render(videoTag, document.getElementById("videoContainer"), playVideo);
        document.getElementById("videoContainer").style.display = 'flex'

        function playVideo() {
            let videoSelector = document.getElementById("video_show");
            videoSelector.onended = () => {
                ReactDOM.render(<div/>, document.getElementById("videoContainer"));
                document.getElementById("videoContainer").style.display = 'none'
                nextSentenceProcessor();
            }
        }
    }

    static closeVideo() {
        ReactDOM.render(<div/>, document.getElementById("videoContainer"));
        document.getElementById("videoContainer").style.display = 'none'
        nextSentenceProcessor();
    }

    static showBacklog() {
        document.getElementById('backlog').style.display = 'block';
        document.getElementById('bottomBox').style.display = 'none';
        ReactDOM.render(<BackLog/>, document.getElementById('backlogContent'));
    }

// 渐显文字
    static showTextArray(textArray) {
        showTextArary(textArray);
    }

    static showTextPreview(text) {
        showTextPreview(text);
    }

    static showMesModel(Title, Left, Right, func) {
        document.getElementById('MesModel').style.display = 'block';
        let element = <MessageModel titleText={Title} Left={Left} Right={Right} func={func}/>;
        ReactDOM.render(element, document.getElementById('MesModel'))
    }

    static VC_showMiniAvatar(name) {
        if (name === '' || name === 'none') {
            ReactDOM.render(<div/>, document.getElementById("miniAvatar"))
            return;
        }
        let url = "game/figure/" + name;
        let pic = <img src={url} className={"miniAvatar_pic"} alt={"miniAvatar"}/>
        ReactDOM.render(pic, document.getElementById("miniAvatar"));
    }

    static VC_setAnimationByClass(name, animate, time) {
        console.log('setting animate by class on: ' + name + 'set to ' + animate);
        let aniString = animate + ' ' + time;
        let editList = document.getElementsByClassName(name);
        for (let i = 0; i < editList.length; i++) {
            editList[i].style.animation = 'none';
        }
        setTimeout(function () {
            for (let i = 0; i < editList.length; i++) {
                editList[i].style.animation = aniString + ' ease';
            }
        }, 1);
    }

    static VC_setAnimationById(id, animate, time) {
        document.getElementById(id).style.animation = 'none';
        setTimeout(() => {
            document.getElementById(id).style.animation = animate + ' ' + time + ' ease';
        }, 1)
    }

// -------- 紧急回避 --------

    static showPanic(showType) {
        document.querySelector('div#panic-overlay').style.display = 'block';
        if (showType === 'Yoozle') {
            let ele = <Yoozle/>
            ReactDOM.render(ele, document.querySelector('div#panic-overlay'));
            document.querySelector('input.yoozle-search-bar').value = '';
        }
    }
}


export {WG_ViewControl}
