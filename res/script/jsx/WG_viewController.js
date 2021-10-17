function VC_changeBG(bg_name){
    document.getElementById('mainBackground').style.backgroundImage = "url('game/background/" + bg_name + "')";
}

function VC_changeP(P_name,pos) {
    if(pos ==='center'){
        if (P_name === 'none'){
            ReactDOM.render(<div/>,document.getElementById('figureImage'));
            currentInfo["fig_Name"] = 'none';
        }else{
            let pUrl = "game/figure/"+P_name;
            let changedP = <img src={pUrl} alt='figure' className='p_center'/>
            // console.log('now changing person');
            ReactDOM.render(changedP,document.getElementById('figureImage'));
            currentInfo["fig_Name"] = P_name;
        }
    }else if(pos === 'left'){
        if (P_name === 'none'){
            ReactDOM.render(<div/>,document.getElementById('figureImage_left'));
            currentInfo["fig_Name_left"] = 'none';
        }else{
            let pUrl = "game/figure/"+P_name;
            let changedP = <img src={pUrl} alt='figure' className='p_center'/>
            // console.log('now changing person');
            ReactDOM.render(changedP,document.getElementById('figureImage_left'));
            currentInfo["fig_Name_left"] = P_name;
        }
    }else if(pos === 'right'){
        if (P_name === 'none'){
            ReactDOM.render(<div/>,document.getElementById('figureImage_right'));
            currentInfo["fig_Name_right"] = 'none';
        }else{
            let pUrl = "game/figure/"+P_name;
            let changedP = <img src={pUrl} alt='figure' className='p_center'/>
            // console.log('now changing person');
            ReactDOM.render(changedP,document.getElementById('figureImage_right'));
            currentInfo["fig_Name_right"] = P_name;
        }
    }
}

function VC_choose(selection,mode){
    if(mode === 'scene'){
        document.getElementById('chooseBox').style.display = 'flex';
        let elements = []
        for (let i = 0; i < selection.length; i++) {
            let temp = <div className='singleChoose' key={i} onClick={()=>{chooseScene(selection[i][1]);}}>{selection[i][0]}</div>
            elements.push(temp)
        }
        ReactDOM.render(<div>{elements}</div>,document.getElementById('chooseBox'))
    }
    if(mode === 'label'){
        document.getElementById('chooseBox').style.display = 'flex';
        let elements = []
        for (let i = 0; i < selection.length; i++) {
            let temp = <div className='singleChoose' key={i} onClick={()=>{chooseJumpFun(selection[i][1]);}}>{selection[i][0]}</div>
            elements.push(temp)
        }
        ReactDOM.render(<div>{elements}</div>,document.getElementById('chooseBox'))
    }
}

function VC_textShow(name,text){
    let changedName = <span>{name}</span>
    let textArray = text.split("");
    ReactDOM.render(changedName, document.getElementById('pName'));
    showTextArray(textArray);
}

function VC_restoreStatus(savedStatus) {
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
        switch (command){
            case 'choose':
                choose_mode = 'scene';
                break;
            case 'choose_label':
                choose_mode = 'label';
                break;
        }
        VC_choose(selection,choose_mode);
    }
    let changedName = <span>{savedStatus["showName"]}</span>
    let textArray = savedStatus["showText"].split("");
    ReactDOM.render(changedName, document.getElementById('pName'));
    SyncCurrentStatus('vocal',savedStatus['vocal']);
    if(getStatus('bgm') !== savedStatus['bgm']){
        currentInfo['bgm'] = savedStatus['bgm'];
        loadBGM();
    }
    playVocal();
    showTextArray(textArray);
}

function VC_showSettings(){
    let settingInterface = <div>
        <div className="singleSettingItem">
            <SettingButtons_font/>
            <SettingButtons_speed/>
            <div className={"deleteCookie"} onClick={()=>{showMesModel('你确定要清除缓存吗','要','不要',clearCookie)}}>清除所有设置选项以及存档</div>
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
    showTextPreview('现在预览的是文本框字体大小和播放速度的情况，您可以根据您的观感调整上面的选项。');
}

function VC_showSave_Load(mode){
    if(mode === 'save'){
        ReactDOM.render(<SaveMainModel PageQty={15}/>,document.getElementById('SaveItems'))
    }else {
        ReactDOM.render(<LoadMainModel PageQty={15}/>,document.getElementById('LoadItems'))
    }
}

function VC_resetStage(){
    // document.getElementById('mainBackground').style.backgroundImage = 'none';
    ReactDOM.render(<div/>,document.getElementById('figureImage'));
    ReactDOM.render(<div/>,document.getElementById('figureImage_left'));
    ReactDOM.render(<div/>,document.getElementById('figureImage_right'));
}

function loadBGM() {
    let bgmName = currentInfo["bgm"];
    if(bgmName === '' || bgmName === 'none'){
        ReactDOM.render(<div/>,document.getElementById("bgm"));
        return;
    }
    let url = "./game/bgm/"+bgmName;
    let audio = <audio src={url} id={"currentBGM"} loop="loop"/>
    ReactDOM.render(audio,document.getElementById("bgm"));
    let playControl = document.getElementById("currentBGM");
    playControl.currentTime = 0;
    playControl.volume = 0.25;
    playControl.play();
}

function playVocal() {
    let vocalName = currentInfo["vocal"];
    let url = './game/vocal/'+vocalName;
    let vocal = <audio src={url} id={"currentVocal"}/>
    ReactDOM.render(vocal,document.getElementById('vocal'));
    let VocalControl = document.getElementById("currentVocal");
    VocalControl.currentTime = 0;
    VocalControl.play();
}

function ren_miniPic(){
    document.getElementById('ren_test').style.display = 'block';
    let backUrl = "./game/background/"+currentInfo["bg_Name"];
    let leftFigUrl = "./game/figure/"+currentInfo["fig_Name_left"];
    let FigUrl = "./game/figure/"+currentInfo["fig_Name"];
    let rightFigUrl = "./game/figure/"+currentInfo["fig_Name_right"];
    let renderList= [];
    if(currentInfo["fig_Name_left"]!=='none'&& currentInfo["fig_Name_left"]!==''){
        let tempIn= <div id={"mini_fig_left"} className={"mini_fig"}>
            <img src={leftFigUrl} alt={"mini_fig"} className={"mini_fig_pic"}/>
        </div>
        renderList.push(tempIn);
    }
    if(currentInfo["fig_Name"]!=='none'&& currentInfo["fig_Name"]!==''){
        let tempIn= <div id={"mini_fig_center"} className={"mini_fig"}>
            <img src={FigUrl} alt={"mini_fig"} className={"mini_fig_pic"}/>
        </div>
        renderList.push(tempIn);
    }
    if(currentInfo["fig_Name_right"]!=='none'&& currentInfo["fig_Name_right"]!==''){
        let tempIn= <div id={"mini_fig_right"} className={"mini_fig"}>
            <img src={rightFigUrl} alt={"mini_fig"} className={"mini_fig_pic"}/>
        </div>
        renderList.push(tempIn);
    }
    let element = <div id={"miniPic"}>
        {renderList}
    </div>
    ReactDOM.render(element,document.getElementById('ren_test'));
    document.getElementById('ren_test').style.backgroundImage = "url('" + backUrl + "')";
}

function showIntro(text){
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
        let singleRow = <div className={"introSingleRow"}>{textArray[i]}</div>;
        introAll.push(singleRow);
        i = i+1;
        ReactDOM.render(<div>{introAll}</div>,document.getElementById("textShowArea"));
        if(i>= textArray.length){
            clearInterval(introInterval);
            setTimeout(clearIntro,3500);
        }
    }
}

// 渐显文字
function showTextArray(textArray){
    showingText = false;
    ReactDOM.render(<span> </span>, document.getElementById('SceneText'));
    let elementArray = [];
    let i = 0;
    clearInterval(interval);
    var interval = setInterval(showSingle,textShowWatiTime);
    showingText = true;
    function showSingle() {
        if(!showingText){
            let textFull = '';
            for (let j = 0;j<textArray.length;j++){
                textFull = textFull+textArray[j];
            }
            ReactDOM.render(<div>{textFull}</div>, document.getElementById('SceneText'));
            if(auto === 1){
                if(i < textArray.length + 1){
                    i = textArray.length + 1;
                }else{
                    i = i+1;
                }
            }else{
                i = textArray.length + 1 +(autoWaitTime/35);
            }

        }else{
            let tempElement = <span key={i} className='singleWord'>{textArray[i]}</span>
            elementArray.push(tempElement);
            ReactDOM.render(<div>{elementArray}</div>, document.getElementById('SceneText'));
            i = i+1;
        }
        if(i > textArray.length && auto !== 1){
            showingText = false;
        }
        if(i > textArray.length +(autoWaitTime/35)){

            if(auto === 1){
                if(document.getElementById('currentVocal')&&fast === 0){
                    if(document.getElementById('currentVocal').ended)
                    {
                        clearInterval(interval);
                        showingText = false;
                        nextSentenceProcessor();
                    }
                }else{
                    clearInterval(interval);
                    showingText = false;
                    nextSentenceProcessor();
                }
            }else{
                showingText = false;
                clearInterval(interval);
            }

        }
    }
}

function showTextPreview(text){
    onTextPreview = onTextPreview+1;
    let textArray = text.split("");
    if(Settings["font_size"] === 'small'){
        document.getElementById('previewDiv').style.fontSize = '150%';
    }else if(Settings["font_size"] === 'medium'){
        document.getElementById('previewDiv').style.fontSize = '200%';
    }else if(Settings["font_size"] === 'large'){
        document.getElementById('previewDiv').style.fontSize = '250%';
    }
    ReactDOM.render(<span> </span>, document.getElementById('previewDiv'));
    let elementArray = [];
    let i = 0;
    clearInterval(interval2);
    var interval2 = setInterval(showSingle,textShowWatiTime);
    function showSingle() {
        if(onTextPreview>1){
            onTextPreview = onTextPreview-1;
            clearInterval(interval2);
            return;
        }
        let tempElement = <span key={i} className='singleWord'>{textArray[i]}</span>
        elementArray.push(tempElement);
        ReactDOM.render(<div>{elementArray}</div>, document.getElementById('previewDiv'));
        i = i+1;
        if(i > textArray.length +(1000/35)){
            clearInterval(interval2);
            interval2 = setInterval(showSingle,textShowWatiTime);
            i = 0;
            elementArray = [];
            if(Settings["font_size"] === 'small'){
                document.getElementById('previewDiv').style.fontSize = '150%';
            }else if(Settings["font_size"] === 'medium'){
                document.getElementById('previewDiv').style.fontSize = '200%';
            }else if(Settings["font_size"] === 'large'){
                document.getElementById('previewDiv').style.fontSize = '250%';
            }
        }
    }
}

function showMesModel(Title,Left,Right,func) {
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

function showBacklog(){
    let even = window.event || arguments.callee.caller.arguments[0];
    even.preventDefault();
    even.stopPropagation();//阻止事件冒泡
    document.getElementById('backlog').style.display = 'block';
    document.getElementById('bottomBox').style.display = 'none';
    let showBacklogList = [];
    for (let i = 0 ; i<CurrentBacklog.length ; i++){
        let temp = <div className={'backlog_singleElement'} key={i} onClick={()=>{jumpFromBacklog(i)}}>
            <div className={"backlog_name"}>{CurrentBacklog[i].showName}</div>
            <div className={"backlog_text"}>{CurrentBacklog[i].showText}</div>
        </div>
        showBacklogList.push(temp)
    }
    ReactDOM.render(<div>{showBacklogList}</div>,document.getElementById('backlogContent'));
}

// -------- 紧急回避 --------

function showPanic(showType) {
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
