import ReactDOM from "react-dom";
import {
CurrentBacklog, SyncCurrentStatus, getStatus, clearCookie, fast, getRuntime
} from "../StoreControl/StoreControl";

import {userInteract} from "../InteractController/UserInteract";
import {
    ControlButton,
    ImporterExporter,
    LoadMainModel,
    SaveMainModel,
    SettingButtons_font,
    SettingButtons_speed
} from "../../Components/UI/etc";
import {nextSentenceProcessor} from "../WG_core";
import React from "react";
import returnIcon from "../../assets/img/return.svg";
import vocalIcon from "../../assets/img/vocal.svg"
import {Return, VolumeNotice} from "@icon-park/react";
import '@icon-park/react/styles/index.css';

class WG_ViewControl {
    static VC_changeBG(bg_name){
        //把背景复制一份成为旧背景，方便做渐变动画
        let BG = document.getElementById('mainBackground');
        let oldBG = BG.cloneNode(true);
        //如果有旧背景节点，删除之
        if(document.getElementById('oldBG')){
            document.getElementById('oldBG').parentNode.removeChild(
                document.getElementById('oldBG')
            )
        }
        oldBG.setAttribute('id','oldBG');
        oldBG.style.webkitAnimation = 'hideBG 5s';
        oldBG.style.animationFillMode = 'forwards';
        console.log(oldBG);
        BG.parentNode.appendChild(oldBG);
        BG.style.backgroundImage = "url('game/background/" + bg_name + "')";
        let newBG=BG.cloneNode(true);
        let parentNodeBG = BG.parentNode;
        parentNodeBG.removeChild(BG);
        parentNodeBG.appendChild(newBG);
    }

    static VC_changeP(P_name,pos) {
        if(pos ==='center'){
            if (P_name === 'none'){
                ReactDOM.render(<div/>,document.getElementById('figureImage'));
                getRuntime().currentInfo["fig_Name"] = 'none';
            }else{
                let pUrl = "game/figure/"+P_name;
                let changedP = <img src={pUrl} alt='figure' className='p_center'/>
                // console.log('now changing person');
                ReactDOM.render(changedP,document.getElementById('figureImage'));
                getRuntime().currentInfo["fig_Name"] = P_name;
            }
        }else if(pos === 'left'){
            if (P_name === 'none'){
                ReactDOM.render(<div/>,document.getElementById('figureImage_left'));
                getRuntime().currentInfo["fig_Name_left"] = 'none';
            }else{
                let pUrl = "game/figure/"+P_name;
                let changedP = <img src={pUrl} alt='figure' className='p_center'/>
                // console.log('now changing person');
                ReactDOM.render(changedP,document.getElementById('figureImage_left'));
                getRuntime().currentInfo["fig_Name_left"] = P_name;
            }
        }else if(pos === 'right'){
            if (P_name === 'none'){
                ReactDOM.render(<div/>,document.getElementById('figureImage_right'));
                getRuntime().currentInfo["fig_Name_right"] = 'none';
            }else{
                let pUrl = "game/figure/"+P_name;
                let changedP = <img src={pUrl} alt='figure' className='p_center'/>
                // console.log('now changing person');
                ReactDOM.render(changedP,document.getElementById('figureImage_right'));
                getRuntime().currentInfo["fig_Name_right"] = P_name;
            }
        }
    }

    static VC_choose(selection,mode){
        if(mode === 'scene'){
            document.getElementById('chooseBox').style.display = 'flex';
            let elements = []
            for (let i = 0; i < selection.length; i++) {
                let temp = <div className='singleChoose' key={i} onClick={()=>{userInteract.chooseScene(selection[i][1]);}}>{selection[i][0]}</div>
                elements.push(temp)
            }
            ReactDOM.render(<div>{elements}</div>,document.getElementById('chooseBox'))
        }
        if(mode === 'label'){
            document.getElementById('chooseBox').style.display = 'flex';
            let elements = []
            for (let i = 0; i < selection.length; i++) {
                let temp = <div className='singleChoose' key={i} onClick={()=>{userInteract.chooseJumpFun(selection[i][1]);}}>{selection[i][0]}</div>
                elements.push(temp)
            }
            ReactDOM.render(<div>{elements}</div>,document.getElementById('chooseBox'))
        }
    }

    static VC_closeChoose(){
        document.getElementById('chooseBox').style.display = 'none';
    }

    static VC_textShow(name,text){
        let changedName = <span>{name}</span>
        let textArray = text.split("");
        ReactDOM.render(changedName, document.getElementById('pName'));
        WG_ViewControl.showTextArray(textArray);
    }

    static VC_restoreStatus(savedStatus) {
        console.log("restoring")
        console.log(savedStatus)
        let command = savedStatus["command"];
        if(savedStatus["bg_Name"]!=='')
            document.getElementById('mainBackground').style.backgroundImage = "url('game/background/" + savedStatus["bg_Name"] + "')";
        if (savedStatus["fig_Name"] === ''||savedStatus["fig_Name"] === 'none'){
            ReactDOM.render(<div/>,document.getElementById('figureImage'));
        }else{
            let pUrl = "game/figure/"+savedStatus["fig_Name"];
            let changedP = <img src={pUrl} alt='figure' className='p_center'/>
            // console.log('now changing person');
            ReactDOM.render(changedP,document.getElementById('figureImage'));
        }
        if (savedStatus["fig_Name_left"] === ''||savedStatus["fig_Name_left"] === 'none'){
            ReactDOM.render(<div/>,document.getElementById('figureImage_left'));
        }else{
            let pUrl = "game/figure/"+savedStatus["fig_Name_left"];
            let changedP = <img src={pUrl} alt='figure' className='p_center'/>
            // console.log('now changing person');
            ReactDOM.render(changedP,document.getElementById('figureImage_left'));
        }
        if (savedStatus["fig_Name_right"] === ''||savedStatus["fig_Name_right"] === 'none'){
            ReactDOM.render(<div/>,document.getElementById('figureImage_right'));
        }else{
            let pUrl = "game/figure/"+savedStatus["fig_Name_right"];
            let changedP = <img src={pUrl} alt='figure' className='p_center'/>
            // console.log('now changing person');
            ReactDOM.render(changedP,document.getElementById('figureImage_right'));
        }
        if(command === 'choose'||command === 'choose_label'){
            let chooseItems =savedStatus["choose"];
            chooseItems = chooseItems.split("}")[0];
            chooseItems = chooseItems.split("{")[1];
            let selection = chooseItems.split(',')
            for (let i = 0;i<selection.length;i++){
                selection[i] = selection[i].split(":");
            }
            let choose_mode = '';
            // eslint-disable-next-line default-case
            switch (command){
                case 'choose':
                    choose_mode = 'scene';
                    break;
                case 'choose_label':
                    choose_mode = 'label';
                    break;
            }
            WG_ViewControl.VC_choose(selection,choose_mode);
        }
        let changedName = <span>{savedStatus["showName"]}</span>
        let textArray = savedStatus["showText"].split("");
        ReactDOM.render(changedName, document.getElementById('pName'));
        SyncCurrentStatus('vocal',savedStatus['vocal']);
        if(getStatus('bgm') !== savedStatus['bgm']){
            getRuntime().currentInfo['bgm'] = savedStatus['bgm'];
            WG_ViewControl.loadBGM();
        }
        if(savedStatus['miniAvatar']!=='' || savedStatus['miniAvatar'] !== 'none'){
            WG_ViewControl.VC_showMiniAvatar(savedStatus['miniAvatar']);
        }
        WG_ViewControl.playVocal();
        WG_ViewControl.showTextArray(textArray);
    }

    static VC_showSettings(){
        let settingInterface = <div>
            <div className={"settingsItemsList"}>
                {/* eslint-disable-next-line react/jsx-pascal-case */}
                <SettingButtons_font/>
                {/* eslint-disable-next-line react/jsx-pascal-case */}
                <SettingButtons_speed/>
                <div className={"deleteCookie"} onClick={()=>{WG_ViewControl.showMesModel('你确定要清除缓存吗','要','不要',clearCookie)}}>清除所有设置选项以及存档</div>
                <ImporterExporter />
                <div>本作品由 WebGAL 强力驱动，<a href={"https://github.com/MakinoharaShoko/WebGAL"}>了解 WebGAL</a>。</div>
                <br/>
                <div className='settingItemTitle'>效果预览</div>
            </div>
        </div>
        document.getElementById("settings").style.display = "flex";
        document.getElementById("bottomBox").style.display = "none";
        ReactDOM.render(settingInterface,document.getElementById("settingItems"));
        ReactDOM.render(<div id="previewDiv" />,document.getElementById('textPreview'));
        WG_ViewControl.showTextPreview('现在预览的是文本框字体大小和播放速度的情况，您可以根据您的观感调整上面的选项。');
    }

    static VC_showSave_Load(mode){
        if(mode === 'save'){
            ReactDOM.render(<SaveMainModel PageQty={15}/>,document.getElementById('SaveItems'))
        }else {
            ReactDOM.render(<LoadMainModel PageQty={15}/>,document.getElementById('LoadItems'))
        }
    }

    static VC_resetStage(){
        // document.getElementById('mainBackground').style.backgroundImage = 'none';
        ReactDOM.render(<div/>,document.getElementById('figureImage'));
        ReactDOM.render(<div/>,document.getElementById('figureImage_left'));
        ReactDOM.render(<div/>,document.getElementById('figureImage_right'));
    }

    static loadBGM() {
        console.log("loadingBGM")
        let bgmName = getRuntime().currentInfo["bgm"];
        console.log("now playing "+bgmName);
        // console.log(getRuntime().currentInfo);
        if(bgmName === '' || bgmName === 'none'){
            console.log("set bgm none");
            if(document.getElementById("currentBGM")){
                document.getElementById("currentBGM").autoplay = false;
                document.getElementById("currentBGM").pause();
            }
            ReactDOM.render(<div/>,document.getElementById("bgm"));
            return;
        }
        let url = "./game/bgm/"+bgmName;
        let audio = <audio src={url} id={"currentBGM"} loop="loop"/>
        // console.log("replace old bgm with an empty div")
        // ReactDOM.render(<div/>,document.getElementById("bgm"));
        ReactDOM.render(audio,document.getElementById("bgm"),audioRendered);
        function audioRendered(){
            let playControl = document.getElementById("currentBGM");
            let played = false;
            console.log(playControl)
            playControl.oncanplay = function (){
                if(played === false)
                {
                    playControl.currentTime = 0;
                    playControl.volume = 0.25;
                    played = true;
                    playControl.play();
                }
            }
            if(played === false && document.getElementById("currentBGM"))
            {
                playControl.currentTime = 0;
                playControl.volume = 0.25;
                played = true;
                playControl.play();
            }
        }
    }

    static playVocal() {
        console.log("Playing vocal:")
        let runtimeTemp = getStatus("all")
        if(document.getElementById('currentVocal')){
            document.getElementById('currentVocal').pause();
        }
        let vocalName = runtimeTemp.vocal;
        if(vocalName === ''){
            ReactDOM.render(<div/>,document.getElementById('vocal'));
            return;
        }
        let url = './game/vocal/'+vocalName;
        let vocal = <audio src={url} id={"currentVocal"}/>
        ReactDOM.render(vocal,document.getElementById('vocal'));
        let VocalControl = document.getElementById("currentVocal");
        VocalControl.currentTime = 0;
        VocalControl.oncanplay = function (){
            VocalControl.play();
        }
    }

    static showIntro(text){
        let i = 0;
        let IntroView =
            <div>
                <div id={"textShowArea"} className={"textShowArea_styl"}>
                </div>
            </div>
        ;
        ReactDOM.render(IntroView,document.getElementById("intro"));
        ReactDOM.render(<div>{" "}</div>,document.getElementById("textShowArea"));
        document.getElementById("intro").style.display = 'block';
        let textArray = text.split(',');
        let introInterval = setInterval(textShow,1500);
        let introAll = [];
        function textShow(){
            let singleRow = <div className={"introSingleRow"} key={i}>{textArray[i]}</div>;
            introAll.push(singleRow);
            i = i+1;
            ReactDOM.render(<div>{introAll}</div>,document.getElementById("textShowArea"));
            if(i>= textArray.length){
                clearInterval(introInterval);
                setTimeout(userInteract.clearIntro,3500);
            }
        }
    }

    static showVideo(videoName){
        let videoTag = <video autoPlay={true} id={"video_show"} src={`./game/video/${videoName}`}/>
        ReactDOM.render(videoTag,document.getElementById("videoContainer"),playVideo);
        document.getElementById("videoContainer").style.display = 'flex'
        function playVideo(){
            let videoSelector = document.getElementById("video_show");
            videoSelector.onended = ()=>{
                ReactDOM.render(<div> </div>,document.getElementById("videoContainer"));
                document.getElementById("videoContainer").style.display = 'none'
                nextSentenceProcessor();
            }
        }
    }
    static closeVideo(){
        ReactDOM.render(<div> </div>,document.getElementById("videoContainer"));
        document.getElementById("videoContainer").style.display = 'none'
        nextSentenceProcessor();
    }

    static loadButton(){
        let renNewButton =  <div className={"toCenter"}>
            <ControlButton color = '#FEDFE1' fun={this.playVocal} name={"重复"} simpleName={"V"}/>
            <ControlButton color = '#FB966E' fun={userInteract.autoNext} name={"自动"} simpleName={"A"} id={"autoButton"}/>
            <ControlButton color = '#FBE251' fun={userInteract.fastNext} name={"快进"} simpleName={"F"}   id={"fastButton"}/>
            <ControlButton color = '#A5DEE4' fun={userInteract.onSaveGame} name={"存档"} simpleName={"S"}/>
            <ControlButton color = '#58B2DC' fun={userInteract.onLoadGame} name={"读档"} simpleName={"L"}/>
            <ControlButton color = '#B28FCE' fun={userInteract.onSetting} name={"设置"} simpleName={"C"}/>
            <ControlButton color = '#BDC0BA' fun={userInteract.Title} name={"标题"} simpleName={"T"}/>
            {/*<ControlButton color = '#FEDFE1' fun={playVocal} name={"重复"} simpleName={"V"}/>*/}
            {/*<ControlButton color = '#FEDFE1' fun={autoNext} name={"自动"} simpleName={"A"} id={"autoButton"}/>*/}
            {/*<ControlButton color = '#FEDFE1' fun={fastNext} name={"快进"} simpleName={"F"}   id={"fastButton"}/>*/}
            {/*<ControlButton color = '#FEDFE1' fun={onSaveGame} name={"存档"} simpleName={"S"}/>*/}
            {/*<ControlButton color = '#FEDFE1' fun={onLoadGame} name={"读档"} simpleName={"L"}/>*/}
            {/*<ControlButton color = '#FEDFE1' fun={onSetting} name={"设置"} simpleName={"C"}/>*/}
            {/*<ControlButton color = '#FEDFE1' fun={Title} name={"标题"} simpleName={"T"}/>*/}
        </div>
        ReactDOM.render(renNewButton,document.getElementById("controlBar"));
    }

    static showBacklog(){
        document.getElementById('backlog').style.display = 'block';
        document.getElementById('bottomBox').style.display = 'none';
        let showBacklogList = [];
        console.log(getRuntime().CurrentBacklog)
        for (let i = 0 ; i<getRuntime().CurrentBacklog.length ; i++){
            let temp = <div className={'backlog_singleElement'} key={i} style={{opacity:0,animationFillMode:'forwards',animationDelay:''+0.07*(getRuntime().CurrentBacklog.length-i)+'s'}}>
                <div className={"backlog_interact"}>
                    <div className={"backlog_interact_button"} onClick={()=>{
                        let vocalName = getRuntime().CurrentBacklog[i].vocal;
                        if(vocalName !== ''){
                            let url = './game/vocal/'+vocalName;
                            let elementAudio = <audio src={url} id={"backlogVocalAudio-"+i} />
                            console.log("Playing! now url is"+url);
                            ReactDOM.render(elementAudio,document.getElementById("backlogVocal-"+i));
                            let singleControlBacklogAudio = document.getElementById("backlogVocalAudio-"+i);
                            let played = false;
                            played = false;
                            singleControlBacklogAudio.oncanplay = function (){
                                if(!played){
                                    singleControlBacklogAudio.currentTime = 0;
                                    played = true;
                                    singleControlBacklogAudio.play();
                                }
                                singleControlBacklogAudio.play();
                            }
                            if(!played){
                                singleControlBacklogAudio.currentTime = 0;
                                played = true;
                                singleControlBacklogAudio.play();
                            }
                        }
                    }}>
                        <VolumeNotice theme="outline" size="24" fill="#f5f5f7"/>
                    </div>
                    <div className={"backlog_interact_button"} onClick={()=>{
                        userInteract.jumpFromBacklog(i);
                    }}>
                        <Return theme="outline" size="24" fill="#f5f5f7"/>
                    </div>
                </div>
                <div className={"backlog_name"}>{getRuntime().CurrentBacklog[i].showName}</div>

                <div className={"backlog_content"}>

                    <div className={"backlog_text"}>{getRuntime().CurrentBacklog[i].showText}</div>
                </div>
                <div id={"backlogVocal-"+i}>

                </div>
            </div>
            showBacklogList.push(temp)
        }
        ReactDOM.render(<div>{showBacklogList}</div>,document.getElementById('backlogContent'));
    }

// 渐显文字
    static showTextArray(textArray){
        getRuntime().showingText = false;
        ReactDOM.render(<span> </span>, document.getElementById('SceneText'));
        let elementArray = [];
        let i = 0;
        clearInterval(interval);
        var interval = setInterval(showSingle,getRuntime().textShowWaitTime);
        getRuntime().showingText = true;
        function showSingle() {
            if(!getRuntime().showingText){
                let textFull = '';
                for (let j = 0;j<textArray.length;j++){
                    textFull = textFull+textArray[j];
                }
                ReactDOM.render(<div>{textFull}</div>, document.getElementById('SceneText'));
                if(getRuntime().auto === 1){
                    if(i < textArray.length + 1){
                        i = textArray.length + 1;
                    }else{
                        i = i+1;
                    }
                }else{
                    i = textArray.length + 1 +(getRuntime().autoWaitTime/35);
                }

            }else{
                let tempElement = <span key={i} className='singleWord'>{textArray[i]}</span>
                elementArray.push(tempElement);
                ReactDOM.render(<div>{elementArray}</div>, document.getElementById('SceneText'));
                i = i+1;
            }
            if(i > textArray.length && getRuntime().auto !== 1){
                getRuntime().showingText = false;
            }
            if(i > textArray.length +(getRuntime().autoWaitTime/35)){
                if(getRuntime().auto === 1){
                    if(document.getElementById('currentVocal') && getRuntime().fast === 0){
                        if(document.getElementById('currentVocal').ended)
                        {
                            clearInterval(interval);
                            getRuntime().showingText = false;
                            nextSentenceProcessor();
                        }
                    }else{
                        clearInterval(interval);
                        getRuntime().showingText = false;
                        nextSentenceProcessor();
                    }
                }else{
                    getRuntime().showingText = false;
                    clearInterval(interval);
                }

            }
        }
    }

    static showTextPreview(text){
        getRuntime().onTextPreview = getRuntime().onTextPreview+1;
        let textArray = text.split("");
        // if(getRuntime().Settings["font_size"] === 'small'){
        //     document.getElementById('previewDiv').style.fontSize = '150%';
        // }else if(getRuntime().Settings["font_size"] === 'medium'){
        //     document.getElementById('previewDiv').style.fontSize = '200%';
        // }else if(getRuntime().Settings["font_size"] === 'large'){
        //     document.getElementById('previewDiv').style.fontSize = '250%';
        // }
        ReactDOM.render(<span> </span>, document.getElementById('previewDiv'));
        let elementArray = [];
        let i = 0;
        clearInterval(interval2);
        var interval2 = setInterval(showSingle,getRuntime().textShowWaitTime);
        function showSingle() {
            if(getRuntime().onTextPreview>1){
                getRuntime().onTextPreview = getRuntime().onTextPreview-1;
                clearInterval(interval2);
                return;
            }
            let tempElement = <span key={i} className='singleWord'>{textArray[i]}</span>
            elementArray.push(tempElement);
            ReactDOM.render(<div>{elementArray}</div>, document.getElementById('previewDiv'));
            i = i+1;
            if(i > textArray.length +(1000/35)){
                clearInterval(interval2);
                interval2 = setInterval(showSingle,getRuntime().textShowWaitTime);
                i = 0;
                elementArray = [];
                // if(getRuntime().Settings["font_size"] === 'small'){
                //     document.getElementById('previewDiv').style.fontSize = '150%';
                // }else if(getRuntime().Settings["font_size"] === 'medium'){
                //     document.getElementById('previewDiv').style.fontSize = '200%';
                // }else if(getRuntime().Settings["font_size"] === 'large'){
                //     document.getElementById('previewDiv').style.fontSize = '250%';
                // }
            }
        }
    }

    static showMesModel(Title,Left,Right,func) {
        document.getElementById('MesModel').style.display='block';
        let element =
            <div className={'MesMainWindow'}>
                <div className={"MesTitle"}>{Title}</div>
                <div className={'MesChooseContainer'}>
                    <div className={'MesChoose'} onClick={()=>{func();document.getElementById('MesModel').style.display='none';}}>{Left}</div>
                    <div className={'MesChoose'} onClick={()=>{document.getElementById('MesModel').style.display='none';}}>{Right}</div>
                </div>
            </div>
        ReactDOM.render(element,document.getElementById('MesModel'))
    }

    static VC_showMiniAvatar(name){
        if(name === '' || name === 'none'){
            ReactDOM.render(<div/>,document.getElementById("miniAvatar"))
            return;
        }
        let url = "game/figure/"+name;
        let pic = <img src={url} className={"miniAvatar_pic"} alt={"miniAvatar"}/>
        ReactDOM.render(pic,document.getElementById("miniAvatar"));
    }

    static VC_setAnimationByClass(name,animate,time){
        console.log('setting animate by class on: '+name+'set to '+animate);
        let aniString = animate+' '+time;
        let editList = document.getElementsByClassName(name);
        for (let i = 0; i < editList.length; i++) {
            editList[i].style.webkitAnimation = 'none';
        }
        setTimeout(function ()
        {
            for (let i = 0; i < editList.length; i++) {
                editList[i].style.webkitAnimation = aniString;
            }
        }, 1);
    }

    static VC_setAnimationById(id,animate,time){
        let aniString = animate+' '+time;
        document.getElementById(id).style.webkitAnimation = aniString;
    }

// -------- 紧急回避 --------

    static showPanic(showType) {
        document.querySelector('div#panic-overlay').style.display = 'block';
        if (showType === 'Yoozle') {
            let ele =
                <div className="yoozle-container">
                    <div className="yoozle-title">
                    <span>
                        <span className="yoozle-gl-blue">Y</span><span className="yoozle-gl-red">o</span><span
                        className="yoozle-gl-yellow">o</span><span className="yoozle-gl-blue">z</span><span
                        className="yoozle-gl-green">l</span><span className="yoozle-gl-red yoozle-e-rotate">e</span>
                    </span>
                    </div>
                    <div className="yoozle-search">
                        <input className="yoozle-search-bar" type="text" defaultValue="" />
                        <div className="yoozle-search-buttons">
                            <input className="yoozle-btn" type="submit" value="Yoozle Search" />
                            <input className="yoozle-btn" type="submit" value="I'm Feeling Lucky" />
                        </div>
                    </div>
                </div>
            ReactDOM.render(ele, document.querySelector('div#panic-overlay'));
            document.querySelector('input.yoozle-search-bar').value = '';
        }
    }
}



export {WG_ViewControl}
