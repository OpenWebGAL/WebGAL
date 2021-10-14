//初始化变量表
{
    var currentScene ='';
    var currentSceneIndex = 0;
    var currentSentence = 0;
    var currentText = 0;
    var auto = 0;
    var fast = 0;
    var setAutoWaitTime = 1500;
    var autoWaitTime = 1500;
    var textShowWatiTime = 35;
    var currentInfo ={
        SceneName:'',//场景文件名
        SentenceID:0,//语句ID
        bg_Name:'',//背景文件名
        fig_Name:'',//立绘_中 文件名
        fig_Name_left:'',//立绘_左 文件名
        fig_Name_right:'',//立绘_右 文件名
        showText:'',//文字
        showName:'',//人物名
        command:'',//语句指令
        choose:'',//选项列表
        currentText:0,//当前文字ID
        vocal:'',//语音 文件名
        bgm:''//背景音乐 文件名
    }
    var onTextPreview = 0;
    var currentName = '';
    var showingText = false;
}

// 初始化存档系统
var Saves=[];
var SaveBacklog=[];

// 初始化backlog存储表
var CurrentBacklog=[];

//初始化需要记录到cookie的变量
var currentSavePage = 0;
var currentLoadPage = 0;

// 初始化设置表
var Settings = {
    font_size: 'medium',
    play_speed:'medium'
};

function loadCookie(){
    if(localStorage.getItem('WebGAL')){
        // let pre_process = document.cookie;
        // let fst = pre_process.split(';')[0];
        // let scd = document.cookie.slice(fst.length+1);
        let data = JSON.parse(localStorage.getItem('WebGAL'));
        Saves = data.SavedGame;
        SaveBacklog = data.SavedBacklog;
        currentSavePage = data.SP;
        currentLoadPage  = data.LP;
        Settings = data.cSettings;
    }
}

function writeCookie(){
    // var expire = new Date((new Date()).getTime() + 20000 * 24 * 60 * 60000);//有效期20000天
    // expire = ";expires=" + expire.toGMTString();
    let toCookie = {
        SavedGame:Saves,
        SavedBacklog:SaveBacklog,
        SP:currentSavePage,
        LP:currentLoadPage,
        cSettings:Settings
    }
    // console.log(JSON.stringify(toCookie));
    localStorage.setItem('WebGAL',JSON.stringify(toCookie));
    // document.cookie = JSON.stringify(toCookie);
}

function clearCookie(){
    let toCookie = {
        SavedGame:[],
        SavedBacklog:[],
        SP:0,
        LP:0,
        cSettings:{
            font_size: 'medium',
            play_speed:'medium'
        }
    }
    localStorage.setItem('WebGAL',JSON.stringify(toCookie));
}

// 读取游戏存档
function LoadSavedGame(index) {
    closeLoad();
    hideTitle('non-restart');
    let save = Saves[index];
    //get Scene:
    let url = 'game/scene/'
    url = url + save['SceneName'];
    currentScene ='';
    currentText = 0;

    let getScReq = null;
    getScReq = new XMLHttpRequest();

    if (getScReq != null) {
        getScReq.open("get",url , true);
        getScReq.send();
        getScReq.onreadystatechange = doResult; //设置回调函数
    }
    function doResult() {
        if (getScReq.readyState === 4) { //4表示执行完成
            if (getScReq.status === 200) { //200表示执行成功
                currentScene = getScReq.responseText;
                currentScene = currentScene.split('\n');
                for (let i = 0;i<currentScene.length;i++){
                    let tempSentence = currentScene[i].split(";")[0];
                    let commandLength = tempSentence.split(":")[0].length;
                    let command = currentScene[i].split(":")[0];
                    let content = tempSentence.slice(commandLength+1);
                    currentScene[i] = currentScene[i].split(":");
                    currentScene[i][0] = command;
                    currentScene[i][1] = content;
                }
                // console.log('Read scene complete.');
                // console.log(currentScene);
                currentSentence = save["SentenceID"];
                currentText = save["SentenceID"];
                // console.log("start:"+currentSentence)

                //load saved scene:
                let command = save["command"];
                // console.log('readSaves:'+command)
                if(save["bg_Name"]!=='')
                    document.getElementById('mainBackground').style.backgroundImage = "url('game/background/" + save["bg_Name"] + "')";
                if (save["fig_Name"] === ''||save["fig_Name"] === 'none'){
                    ReactDOM.render(<div/>,document.getElementById('figureImage'));
                }else{
                    let pUrl = "game/figure/"+save["fig_Name"];
                    let changedP = <img src={pUrl} alt='figure' className='p_center'/>
                    // console.log('now changing person');
                    ReactDOM.render(changedP,document.getElementById('figureImage'));
                }
                if (save["fig_Name_left"] === ''||save["fig_Name_left"] === 'none'){
                    ReactDOM.render(<div/>,document.getElementById('figureImage_left'));
                }else{
                    let pUrl = "game/figure/"+save["fig_Name_left"];
                    let changedP = <img src={pUrl} alt='figure' className='p_center'/>
                    // console.log('now changing person');
                    ReactDOM.render(changedP,document.getElementById('figureImage_left'));
                }
                if (save["fig_Name_right"] === ''||save["fig_Name_right"] === 'none'){
                    ReactDOM.render(<div/>,document.getElementById('figureImage_right'));
                }else{
                    let pUrl = "game/figure/"+save["fig_Name_right"];
                    let changedP = <img src={pUrl} alt='figure' className='p_center'/>
                    // console.log('now changing person');
                    ReactDOM.render(changedP,document.getElementById('figureImage_right'));
                }

                if(command === 'choose'){
                    document.getElementById('chooseBox').style.display = 'flex';
                    let chooseItems =save["choose"];
                    chooseItems = chooseItems.split("}")[0];
                    chooseItems = chooseItems.split("{")[1];
                    let selection = chooseItems.split(',')
                    for (let i = 0;i<selection.length;i++){
                        selection[i] = selection[i].split(":");
                    }
                    let elements = []
                    for (let i = 0; i < selection.length; i++) {
                        let temp = <div className='singleChoose' key={i} onClick={()=>{chooseScene(selection[i][1]);}}>{selection[i][0]}</div>
                        elements.push(temp)
                    }
                    ReactDOM.render(<div>{elements}</div>,document.getElementById('chooseBox'))
                    // return;
                }
                let changedName = <span>{save["showName"]}</span>
                let textArray = save["showText"].split("");
                // let changedText = <p>{processSentence(currentSentence)['text']}</p>
                ReactDOM.render(changedName, document.getElementById('pName'));
                currentText = save["currentText"];
                currentInfo["vocal"] = save['vocal'];
                if(currentInfo['bgm'] !== save['bgm']){
                    currentInfo['bgm'] = save['bgm'];
                    loadBGM();
                }
                playVocal();
                showTextArray(textArray,currentText);
                // currentText = currentText + 1;

                // currentSentence = currentSentence+1;
            }
        }
    }
    CurrentBacklog = SaveBacklog[index];

}

// 保存当前游戏状态
function saveGame(index){
    let tempInfo = JSON.stringify(currentInfo);
    Saves[index] = JSON.parse(tempInfo);
    let tempBacklog = JSON.stringify(CurrentBacklog);
    SaveBacklog[index]= JSON.parse(tempBacklog);
    writeCookie();
}

// 获取场景脚本
function getScene(url) {
    currentScene ='';
    currentText = 0;

    let getScReq = null;
    getScReq = new XMLHttpRequest();
    console.log('now read scene')
    if (getScReq != null) {
        getScReq.open("get",url , true);
        getScReq.send();
        getScReq.onreadystatechange = doResult; //设置回调函数
    }
    function doResult() {
        if (getScReq.readyState === 4) { //4表示执行完成
            if (getScReq.status === 200) { //200表示执行成功
                currentScene = getScReq.responseText;
                currentScene = currentScene.split('\n');
                for (let i = 0;i<currentScene.length;i++){
                    let tempSentence = currentScene[i].split(";")[0];
                    let commandLength = tempSentence.split(":")[0].length;
                    let command = currentScene[i].split(":")[0];
                    command = command.split(';')[0];
                    let content = tempSentence.slice(commandLength+1);
                    currentScene[i] = currentScene[i].split(":");
                    currentScene[i][0] = command;
                    currentScene[i][1] = content;
                }
                // console.log('Read scene complete.');
                // console.log(currentScene);
                currentSentence = 0;
                // console.log("start:"+currentSentence)
                nextSentenceProcessor();
            }
        }
    }

}

// 引擎加载完成
window.onload = function () {
    loadCookie();
    loadSettings();
    document.getElementById('Title').style.backgroundImage = 'url("./game/background/Title.png")';
    if(isMobile()){
        console.log("nowis mobile view");
        document.getElementById('bottomBox').style.height = '45%';
        document.getElementById('TitleModel').style.height = '20%';
    }
}

function loadSettings(){
    if(Settings["font_size"] === 'small'){
        document.getElementById('SceneText').style.fontSize = '150%';
    }else if(Settings["font_size"] === 'medium'){
        document.getElementById('SceneText').style.fontSize = '200%';
    }else if(Settings["font_size"] === 'large'){
        document.getElementById('SceneText').style.fontSize = '250%';
    }

    if(Settings["play_speed"] === 'low'){
        textShowWatiTime = 150;
    } else if(Settings["play_speed"] === 'medium'){
        textShowWatiTime = 50;
    }else if(Settings["play_speed"] === 'fast'){
        textShowWatiTime = 10;
    }
}

// 处理脚本
function processSentence(i){
    if(i<currentScene.length)
    {
        let vocal = '';
        if(currentScene[i][1] !== '')
        {
            let text = currentScene[i][1];
            if(currentScene[i][1].split('vocal-').length > 1)
            {
                vocal = currentScene[i][1].split('vocal-')[1].split(',')[0];
                text = currentScene[i][1].split('vocal-')[1].slice(currentScene[i][1].split('vocal-')[1].split(',')[0].length+1);
            }
            currentName = currentScene[i][0];
            return {name:currentName,text:text,vocal:vocal};
        }
        else
        {
            let text = currentScene[i][0];
            if(currentScene[i][0].split('vocal-').length > 1){
                vocal = currentScene[i][0].split('vocal-')[1].split(',')[0];
                text = currentScene[i][0].split('vocal-')[1].slice(currentScene[i][0].split('vocal-')[1].split(',')[0].length+1);
            }
            return {name:currentName,text:text,vocal:vocal};
        }


    }

}

// 读取下一条脚本
function nextSentenceProcessor() {
    if(showingText){
        showingText = false;
        return;
    }
    let saveBacklogNow = false;
    if(currentSentence >= currentScene.length){
        return;
    }
    let thisSentence = currentScene[currentSentence];
    let command = thisSentence[0];
    // console.log(command)
    if (command === 'changeBG') {
        // console.log('Now change background to ' + "url('/game/background/" + thisSentence[1] + "')");
        document.getElementById('mainBackground').style.backgroundImage = "url('game/background/" + thisSentence[1] + "')";
        currentInfo["bg_Name"]= thisSentence[1];
        autoPlay('on');
    }
    else if(command === 'changeP'){
        if (thisSentence[1] === 'none'){
            ReactDOM.render(<div/>,document.getElementById('figureImage'));
            currentInfo["fig_Name"] = 'none';
        }else{
            let pUrl = "game/figure/"+thisSentence[1];
            let changedP = <img src={pUrl} alt='figure' className='p_center'/>
            // console.log('now changing person');
            ReactDOM.render(changedP,document.getElementById('figureImage'));
            currentInfo["fig_Name"] = thisSentence[1];
        }
        autoPlay('on');
    }
    else if(command === 'changeP_left'){
        if (thisSentence[1] === 'none'){
            ReactDOM.render(<div/>,document.getElementById('figureImage_left'));
            currentInfo["fig_Name_left"] = 'none';
        }else{
            let pUrl = "game/figure/"+thisSentence[1];
            let changedP = <img src={pUrl} alt='figure' className='p_center'/>
            // console.log('now changing person');
            ReactDOM.render(changedP,document.getElementById('figureImage_left'));
            currentInfo["fig_Name_left"] = thisSentence[1];
        }
        autoPlay('on');
    }
    else if(command === 'changeP_right'){
        if (thisSentence[1] === 'none'){
            ReactDOM.render(<div/>,document.getElementById('figureImage_right'));
            currentInfo["fig_Name_right"] = 'none';
        }else{
            let pUrl = "game/figure/"+thisSentence[1];
            let changedP = <img src={pUrl} alt='figure' className='p_center'/>
            // console.log('now changing person');
            ReactDOM.render(changedP,document.getElementById('figureImage_right'));
            currentInfo["fig_Name_right"] = thisSentence[1];
        }
        autoPlay('on');
    }
    else if(command === 'changeP_left_next'){
        if (thisSentence[1] === 'none'){
            ReactDOM.render(<div/>,document.getElementById('figureImage_left'));
            currentInfo["fig_Name_left"] = 'none';
        }else{
            let pUrl = "game/figure/"+thisSentence[1];
            let changedP = <img src={pUrl} alt='figure' className='p_center'/>
            // console.log('now changing person');
            ReactDOM.render(changedP,document.getElementById('figureImage_left'));
            currentInfo["fig_Name_left"] = thisSentence[1];
        }
        currentSentence = currentSentence+1;
        nextSentenceProcessor();
        return;
    }
    else if(command === 'changeP_right_next'){
        if (thisSentence[1] === 'none'){
            ReactDOM.render(<div/>,document.getElementById('figureImage_right'));
            currentInfo["fig_Name_right"] = 'none';
        }else{
            let pUrl = "game/figure/"+thisSentence[1];
            let changedP = <img src={pUrl} alt='figure' className='p_center'/>
            // console.log('now changing person');
            ReactDOM.render(changedP,document.getElementById('figureImage_right'));
            currentInfo["fig_Name_right"] = thisSentence[1];
        }
        currentSentence = currentSentence+1;
        nextSentenceProcessor();
        return;
    }
    else if(command === 'changeP_next'){
        if (thisSentence[1] === 'none'){
            ReactDOM.render(<div/>,document.getElementById('figureImage'));
            currentInfo["fig_Name"] = thisSentence[1];
        }else{
            let pUrl = "game/figure/"+thisSentence[1];
            let changedP = <img src={pUrl} alt='figure' className='p_center'/>
            // console.log('now changing person');
            ReactDOM.render(changedP,document.getElementById('figureImage'));
            currentInfo["fig_Name"] = thisSentence[1];
        }
        currentSentence = currentSentence+1;
        nextSentenceProcessor();
        return;
    }
    else if(command === 'changeBG_next'){
        document.getElementById('mainBackground').style.backgroundImage = "url('game/background/" + thisSentence[1] + "')";
        currentSentence = currentSentence+1;
        currentInfo["bg_Name"] = thisSentence[1];
        nextSentenceProcessor();
        return;
    }
    else if(command === 'changeScene'){
        let sUrl = "game/scene/"+thisSentence[1];
        let SceneName =  thisSentence[1];
        getScene(sUrl);
        currentInfo["SceneName"] =SceneName;
        return;
    }
    else if(command === 'choose'){
        currentInfo["command"] = command;
        document.getElementById('chooseBox').style.display = 'flex';
        let chooseItems =thisSentence[1];
        currentInfo["choose"]=chooseItems;
        chooseItems = chooseItems.split("}")[0];
        chooseItems = chooseItems.split("{")[1];
        let selection = chooseItems.split(',')
        for (let i = 0;i<selection.length;i++){
            selection[i] = selection[i].split(":");
        }
        let elements = []
        for (let i = 0; i < selection.length; i++) {
            let temp = <div className='singleChoose' key={i} onClick={()=>{chooseScene(selection[i][1]);}}>{selection[i][0]}</div>
            elements.push(temp)
        }
        ReactDOM.render(<div>{elements}</div>,document.getElementById('chooseBox'))
        return;
    }
    else if(command === 'bgm'){
        currentInfo["bgm"] = thisSentence[1];
        loadBGM();
        currentSentence = currentSentence+1;
        nextSentenceProcessor();
        return;
    }
    else if(command === 'choose_label'){

        currentInfo["command"] = command;
        document.getElementById('chooseBox').style.display = 'flex';
        let chooseItems =thisSentence[1];
        currentInfo["choose"]=chooseItems;
        chooseItems = chooseItems.split("}")[0];
        chooseItems = chooseItems.split("{")[1];
        let selection = chooseItems.split(',')
        for (let i = 0;i<selection.length;i++){
            selection[i] = selection[i].split(":");
        }
        let elements = []
        for (let i = 0; i < selection.length; i++) {
            let temp = <div className='singleChoose' key={i} onClick={()=>{chooseJumpFun(selection[i][1]);}}>{selection[i][0]}</div>
            elements.push(temp)
        }
        ReactDOM.render(<div>{elements}</div>,document.getElementById('chooseBox'))
        return;
    }
    else if(command === 'jump_label'){
        let lab_name = thisSentence[1];
        //find the line of the label:
        let find = false;
        let jmp_sentence = 0;
        for (let i = 0; i < currentScene.length; i++) {
            if(currentScene[i][0] === 'label' && currentScene[i][1] === lab_name){
                find = true;
                jmp_sentence = i;
            }
        }
        if(find){
            currentSentence = jmp_sentence;
            nextSentenceProcessor();
            return;
        }else
        {
            currentSentence = currentSentence+1;
            nextSentenceProcessor();
            return;
        }
    }
    else if(command === 'label'){
        currentSentence = currentSentence+1;
        nextSentenceProcessor();
        return;
    }
    else if(command === 'intro'){
        let introText = thisSentence[1];
        showIntro(introText);
        return;
    }
    else {
        currentInfo["command"] = processSentence(currentSentence)['name'];
        currentInfo["showName"] = processSentence(currentSentence)['name'];
        currentInfo["showText"] = processSentence(currentSentence)['text'];
        currentInfo["vocal"] = processSentence(currentSentence)['vocal'];
        let changedName = <span>{processSentence(currentSentence)['name']}</span>
        let textArray = processSentence(currentSentence)['text'].split("");
        // let changedText = <p>{processSentence(currentSentence)['text']}</p>
        ReactDOM.render(changedName, document.getElementById('pName'));
        if(currentInfo["vocal"]!== ''){
            playVocal();
        }
        saveBacklogNow = true;
        showTextArray(textArray,currentText+1);
        currentText = currentText + 1;
        currentInfo["currentText"] = currentText;
    }
    currentSentence = currentSentence+1;
    currentInfo["SentenceID"] = currentSentence;
    if(saveBacklogNow){
        if(CurrentBacklog.length<=500){
            let temp = JSON.stringify(currentInfo);
            let pushElement = JSON.parse(temp);
            CurrentBacklog.push(pushElement);
        }else{
            CurrentBacklog.shift();
            let temp = JSON.stringify(currentInfo);
            let pushElement = JSON.parse(temp);
            CurrentBacklog.push(pushElement);
        }
    }

    function autoPlay(active){
        if(auto === 1 && active === 'on'){
            let interval = setInterval(jumpNext,autoWaitTime);
            function jumpNext(){
                if(auto === 1)
                    nextSentenceProcessor();
                clearInterval(interval);
            }

        }
    }
}

// 渐显文字
function showTextArray(textArray,now){
    showingText = false;
    ReactDOM.render(<span> </span>, document.getElementById('SceneText'));
    let elementArray = [];
    let i = 0;
    clearInterval(interval);
    var interval = setInterval(showSingle,textShowWatiTime);
    // console.log("now: "+now+" currentText: "+currentText)
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
            if(currentText === now)
                ReactDOM.render(<div>{elementArray}</div>, document.getElementById('SceneText'));
            i = i+1;
        }
        if(i > textArray.length && auto !== 1){
            showingText = false;
        }
        if(i > textArray.length +(autoWaitTime/35) || currentText!== now){

            if(auto === 1 && currentText === now){
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

function chooseJumpFun(label){
    let lab_name = label;
    //find the line of the label:
    let find = false;
    let jmp_sentence = 0;
    for (let i = 0; i < currentScene.length; i++) {
        if(currentScene[i][0] === 'label' && currentScene[i][1] === lab_name){
            find = true;
            jmp_sentence = i;
        }
    }
    if(find){
        currentSentence = jmp_sentence;
        nextSentenceProcessor();
        document.getElementById("chooseBox").style.display="none"
    }else
    {
        currentSentence = currentSentence+1;
        nextSentenceProcessor();
        document.getElementById("chooseBox").style.display="none"
    }
}

// 打开设置
function onSetting(){
    loadCookie();
    let settingInterface = <div>
        <div className="singleSettingItem">
            <SettingButtons_font/>
            <SettingButtons_speed/>
            <div className={"deleteCookie"} onClick={()=>{showMesModel('你确定要清除缓存吗','要','不要',clearCookie)}}>清除所有设置选项以及存档</div>
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

// 关闭设置
function closeSettings(){
    document.getElementById("settings").style.display = "none"
    document.getElementById("bottomBox").style.display = "flex"
}

// 分支选择
function chooseScene(url){
    // console.log(url);
    currentInfo["SceneName"] = url;
    let sUrl = "game/scene/"+url;
    getScene(sUrl);
    document.getElementById("chooseBox").style.display="none"
}

//自动播放
function autoNext(){
    if(auto === 0){
        autoWaitTime = setAutoWaitTime;
        textShowWatiTime = 35
        fast = 0;
        auto = 0;
        document.getElementById('fastButton').style.backgroundColor = 'rgba(255,255,255,0)';
        document.getElementById('fastButton').style.color = 'white';
        // console.log("notFast");
        autoWaitTime = setAutoWaitTime;
        auto = 1;
        // console.log("auto");
        document.getElementById('autoButton').style.backgroundColor = 'rgba(255,255,255,0.8)';
        document.getElementById('autoButton').style.color = '#8E354A';
        nextSentenceProcessor();

    }
    else if(auto === 1){
        autoWaitTime = setAutoWaitTime;
        auto = 0;
        document.getElementById('autoButton').style.backgroundColor = 'rgba(255,255,255,0)';
        document.getElementById('autoButton').style.color = 'white';
        // console.log("notAuto");
    }
}

// 快进
function fastNext(){
    if(fast === 0){
        autoWaitTime = setAutoWaitTime;
        auto = 0;
        document.getElementById('autoButton').style.backgroundColor = 'rgba(255,255,255,0)';
        document.getElementById('autoButton').style.color = 'white';
        // console.log("notAuto");
        autoWaitTime = 500;
        textShowWatiTime = 5;
        fast = 1;
        auto = 1;
        // console.log("fast");
        document.getElementById('fastButton').style.backgroundColor = 'rgba(255,255,255,0.8)';
        document.getElementById('fastButton').style.color = '#8E354A';
        nextSentenceProcessor();

    }
    else if(fast === 1){
        autoWaitTime = setAutoWaitTime;
        textShowWatiTime = 35
        fast = 0;
        auto = 0;
        document.getElementById('fastButton').style.backgroundColor = 'rgba(255,255,255,0)';
        document.getElementById('fastButton').style.color = 'white';
        // console.log("notFast");
    }
}

class SettingButtons_font extends React.Component{
    constructor(props) {
        super(props);
        this.state = {buttonState : ['','','']}
    }

    componentDidMount() {
        let buttonStateNow = ['','',''];
        if(Settings['font_size'] === 'small'){
            buttonStateNow[0] = 'On';
        }else if (Settings['font_size'] === 'medium'){
            buttonStateNow[1] = 'On';
        }else if (Settings['font_size'] === 'large'){
            buttonStateNow[2] = 'On';
        }
        this.setState(
            {
                buttonState:buttonStateNow
            }
        )
    }


    componentWillUnmount() {
    }

    changeButtonState(i){
        if(i === 0){
            Settings['font_size'] = 'small';
            document.getElementById('SceneText').style.fontSize = '150%';
        }else if(i === 1){
            Settings["font_size"] = 'medium';
            document.getElementById('SceneText').style.fontSize = '200%';
        }else if(i === 2){
            Settings["font_size"] = 'large';
            document.getElementById('SceneText').style.fontSize = '250%';
        }
        let buttonStateNow = ['','',''];
        if(Settings['font_size'] === 'small'){
            buttonStateNow[0] = 'On';
        }else if (Settings['font_size'] === 'medium'){
            buttonStateNow[1] = 'On';
        }else if (Settings['font_size'] === 'large'){
            buttonStateNow[2] = 'On';
        }
        writeCookie();
        this.setState(
            {
                buttonState:buttonStateNow
            }
        )
    }


    render(){

        return(
            <span className="singleSettingItem">
                <span className="settingItemTitle">字体大小</span>
                <span className={'settingItemButton'+this.state.buttonState[0]} onClick={()=>{this.changeButtonState(0)}}>小</span>
                <span className={'settingItemButton'+this.state.buttonState[1]} onClick={()=>{this.changeButtonState(1)}}>中</span>
                <span className={'settingItemButton'+this.state.buttonState[2]} onClick={()=>{this.changeButtonState(2)}}>大</span>
            </span>
        );
    }

}

class SettingButtons_speed extends React.Component{
    constructor(props) {
        super(props);
        this.state = {buttonState : ['','','']}
    }

    componentDidMount() {
        let buttonStateNow = ['','',''];
        if(Settings['play_speed'] === 'low'){
            buttonStateNow[0] = 'On';
        }else if (Settings['play_speed'] === 'medium'){
            buttonStateNow[1] = 'On';
        }else if (Settings['play_speed'] === 'fast'){
            buttonStateNow[2] = 'On';
        }
        this.setState(
            {
                buttonState:buttonStateNow
            }
        )
    }


    componentWillUnmount() {
    }

    changeButtonState(i){
        if(i === 0){
            Settings['play_speed'] = 'low';
            textShowWatiTime = 55;
        }else if(i === 1){
            Settings["play_speed"] = 'medium';
            textShowWatiTime = 35;
        }else if(i === 2){
            Settings["play_speed"] = 'fast';
            textShowWatiTime = 20;
        }
        let buttonStateNow = ['','',''];
        if(Settings['play_speed'] === 'low'){
            buttonStateNow[0] = 'On';
        }else if (Settings['play_speed'] === 'medium'){
            buttonStateNow[1] = 'On';
        }else if (Settings['play_speed'] === 'fast'){
            buttonStateNow[2] = 'On';
        }
        writeCookie();
        this.setState(
            {
                buttonState:buttonStateNow
            }
        )
    }


    render(){

        return(
            <span className="singleSettingItem">
                <span className="settingItemTitle">播放速度</span>
                <span className={'settingItemButton'+this.state.buttonState[0]} onClick={()=>{this.changeButtonState(0)}}>慢</span>
                <span className={'settingItemButton'+this.state.buttonState[1]} onClick={()=>{this.changeButtonState(1)}}>中</span>
                <span className={'settingItemButton'+this.state.buttonState[2]} onClick={()=>{this.changeButtonState(2)}}>快</span>
            </span>
        );
    }

}

function hideTitle(ifRes) {
    CurrentBacklog = [];
    document.getElementById('Title').style.display = 'none';
    if(ifRes !== 'non-restart'){
        currentInfo["bgm"] = '';
        loadBGM();
        ReactDOM.render(<div/>,document.getElementById('figureImage'));
        currentInfo["fig_Name"] = '';
        ReactDOM.render(<div/>,document.getElementById('figureImage_left'));
        currentInfo["fig_left"] = '';
        ReactDOM.render(<div/>,document.getElementById('figureImage_right'));
        currentInfo["fig_right"] = '';
        getScene("game/scene/start.txt");
        currentInfo["SceneName"] = 'start.txt';

    }
}

function onLoadGame() {
    loadCookie();
    document.getElementById('Load').style.display = 'block';
    ReactDOM.render(<LoadMainModel PageQty={15}/>,document.getElementById('LoadItems'))
}

function closeLoad() {
    document.getElementById('Load').style.display = 'none';
}

class LoadMainModel extends  React.Component{
    Buttons = [];
    SaveButtons = [];
    LoadPageQty = 0;
    setCurrentPage(page){
        currentLoadPage = page;
        this.setState({
            currentPage:currentLoadPage
        })
        writeCookie();
    }

    loadButtons(){
        this.Buttons = [];
        for (let i = 0; i < this.LoadPageQty; i++) {
            let temp =<span className="LoadIndexButton" onClick={()=>{this.setCurrentPage(i)}} key={i}>{i+1}</span>
            if(i === currentLoadPage)
                temp =<span className="LoadIndexButtonOn" onClick={()=>{this.setCurrentPage(i)}} key={i}>{i+1}</span>
            this.Buttons.push(temp);
        }
    }

    loadSaveButtons(){
        this.SaveButtons = [];
        for (let i = currentLoadPage*5+1; i <= currentLoadPage*5+5; i++) {
            if(Saves[i]){
                let thisButtonName = Saves[i]["showName"];
                let thisButtonText = Saves[i]["showText"];
                let temp = <div className="LoadSingleElement" key={i} onClick={()=>{LoadSavedGame(i)}}>
                    <div className="LSE_top">
                        <span className={"LSE_index"}>{i}</span>
                        <span className={"LSE_name"}>{thisButtonName}</span>
                    </div>
                    <div className="LSE_bottom">
                        {thisButtonText}
                    </div>
                </div>
                this.SaveButtons.push(temp);
            }else
            {
                let temp = <div className="LoadSingleElement" key={i}>空</div>
                this.SaveButtons.push(temp);
                // console.log(i)
            }

        }
    }

    constructor(props) {
        super(props);
        this.LoadPageQty = props.PageQty;
        this.state = {
            currentPage:currentLoadPage
        }
        this.loadButtons();
    }

    componentDidMount() {
    }


    componentWillUnmount() {
    }

    render(){
        this.loadButtons();
        this.loadSaveButtons();
        return(
            <div id="LoadMain">
                <div id="LoadIndex">
                    {this.Buttons}
                </div>
                <div id="LoadButtonList">
                    {this.SaveButtons}
                </div>
            </div>

        );
    }
}

function onSaveGame() {
    loadCookie();
    document.getElementById('Save').style.display = 'block';
    ReactDOM.render(<SaveMainModel PageQty={15}/>,document.getElementById('SaveItems'))
}

function closeSave() {
    document.getElementById('Save').style.display = 'none';
}

class SaveMainModel extends  React.Component{
    Buttons = [];
    SaveButtons = [];
    LoadPageQty = 0;
    setCurrentPage(page){
        currentSavePage = page;
        this.setState({
            currentPage:currentSavePage
        })
        writeCookie();
    }

    loadButtons(){
        this.Buttons = [];
        for (let i = 0; i < this.LoadPageQty; i++) {
            let temp =<span className="SaveIndexButton" onClick={()=>{this.setCurrentPage(i)}} key={i}>{i+1}</span>
            if(i === currentSavePage)
                temp =<span className="SaveIndexButtonOn" onClick={()=>{this.setCurrentPage(i)}} key={i}>{i+1}</span>
            this.Buttons.push(temp);
        }
    }

    loadSaveButtons(){
        this.SaveButtons = [];
        for (let i = currentSavePage*5+1; i <= currentSavePage*5+5; i++) {
            if(Saves[i]){
                let thisButtonName = Saves[i]["showName"];
                let thisButtonText = Saves[i]["showText"];
                let temp = <div className="SaveSingleElement" key={i} onClick={()=>{this.save_onSaved(i)}}>
                    <div className="SSE_top">
                        <span className={"SSE_index"}>{i}</span>
                        <span className={"SSE_name"}>{thisButtonName}</span>
                    </div>
                    <div className="SSE_bottom">
                        {thisButtonText}
                    </div>
                </div>
                this.SaveButtons.push(temp);
            }else
            {
                let temp = <div className="SaveSingleElement" key={i} onClick={()=>{this.save_NonSaved(i)}}>空</div>
                this.SaveButtons.push(temp);
                // console.log(i)
            }

        }
    }

    save_NonSaved(index){
        saveGame(index);
        writeCookie();
        this.setState({
            currentPage:currentSavePage
        });
    }

    save_onSaved(index){
        showMesModel('你要覆盖这个存档吗','覆盖','不',function () {
            saveGame(index);
            writeCookie();
            closeSave();
        })
        this.setState({
            currentPage:currentSavePage
        });
    }

    constructor(props) {
        super(props);
        this.LoadPageQty = props.PageQty;
        this.state = {
            currentPage:currentSavePage
        }
        this.loadButtons();
    }

    componentDidMount() {
    }


    componentWillUnmount() {
    }

    render(){
        this.loadButtons();
        this.loadSaveButtons();
        return(
            <div id="SaveMain">
                <div id="SaveIndex">
                    {this.Buttons}
                </div>
                <div id="SaveButtonList">
                    {this.SaveButtons}
                </div>
            </div>

        );
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

function exit(){
    showMesModel('你确定要退出吗','退出','留在本页',function (){window.close()})
}

function Title() {
    showMesModel('要返回到标题界面吗','是','不要',function (){document.getElementById('Title').style.display = 'block';})
}

function continueGame(){
    if(currentScene === ''){
        getScene("game/scene/start.txt");
        currentInfo["SceneName"] = 'start.txt';
    }
    document.getElementById('Title').style.display = 'none';
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

function jumpFromBacklog(index) {
    closeBacklog();
    let save = CurrentBacklog[index];
    for (let i = CurrentBacklog.length - 1 ; i > index ; i--){
        CurrentBacklog.pop();
    }
    //get Scene:
    let url = 'game/scene/'
    url = url + save['SceneName'];
    currentScene ='';
    currentText = 0;

    let getScReq = null;
    getScReq = new XMLHttpRequest();

    if (getScReq != null) {
        getScReq.open("get",url , true);
        getScReq.send();
        getScReq.onreadystatechange = doResult; //设置回调函数
    }
    function doResult() {
        if (getScReq.readyState === 4) { //4表示执行完成
            if (getScReq.status === 200) { //200表示执行成功
                currentScene = getScReq.responseText;
                currentScene = currentScene.split('\n');
                for (let i = 0;i<currentScene.length;i++){
                    let tempSentence = currentScene[i].split(";")[0];
                    let commandLength = tempSentence.split(":")[0].length;
                    let command = currentScene[i].split(":")[0];
                    let content = tempSentence.slice(commandLength+1);
                    currentScene[i] = currentScene[i].split(":");
                    currentScene[i][0] = command;
                    currentScene[i][1] = content;
                }
                // console.log('Read scene complete.');
                // console.log(currentScene);
                currentSentence = save["SentenceID"];
                currentText = save["SentenceID"];
                // console.log("start:"+currentSentence)

                //load saved scene:
                let command = save["command"];
                // console.log('readSaves:'+command)
                if(save["bg_Name"]!=='')
                    document.getElementById('mainBackground').style.backgroundImage = "url('game/background/" + save["bg_Name"] + "')";
                if (save["fig_Name"] === ''||save["fig_Name"] === 'none'){
                    ReactDOM.render(<div/>,document.getElementById('figureImage'));
                }else{
                    let pUrl = "game/figure/"+save["fig_Name"];
                    let changedP = <img src={pUrl} alt='figure' className='p_center'/>
                    // console.log('now changing person');
                    ReactDOM.render(changedP,document.getElementById('figureImage'));
                }
                if (save["fig_Name_left"] === ''||save["fig_Name_left"] === 'none'){
                    ReactDOM.render(<div/>,document.getElementById('figureImage_left'));
                }else{
                    let pUrl = "game/figure/"+save["fig_Name_left"];
                    let changedP = <img src={pUrl} alt='figure' className='p_center'/>
                    // console.log('now changing person');
                    ReactDOM.render(changedP,document.getElementById('figureImage_left'));
                }
                if (save["fig_Name_right"] === ''||save["fig_Name_right"] === 'none'){
                    ReactDOM.render(<div/>,document.getElementById('figureImage_right'));
                }else{
                    let pUrl = "game/figure/"+save["fig_Name_right"];
                    let changedP = <img src={pUrl} alt='figure' className='p_center'/>
                    // console.log('now changing person');
                    ReactDOM.render(changedP,document.getElementById('figureImage_right'));
                }

                if(command === 'choose'){
                    document.getElementById('chooseBox').style.display = 'flex';
                    let chooseItems =save["choose"];
                    chooseItems = chooseItems.split("}")[0];
                    chooseItems = chooseItems.split("{")[1];
                    let selection = chooseItems.split(',')
                    for (let i = 0;i<selection.length;i++){
                        selection[i] = selection[i].split(":");
                    }
                    let elements = []
                    for (let i = 0; i < selection.length; i++) {
                        let temp = <div className='singleChoose' key={i} onClick={()=>{chooseScene(selection[i][1]);}}>{selection[i][0]}</div>
                        elements.push(temp)
                    }
                    ReactDOM.render(<div>{elements}</div>,document.getElementById('chooseBox'))
                    // return;
                }
                let changedName = <span>{save["showName"]}</span>
                let textArray = save["showText"].split("");
                // let changedText = <p>{processSentence(currentSentence)['text']}</p>
                ReactDOM.render(changedName, document.getElementById('pName'));
                currentText = save["currentText"];
                currentInfo["vocal"] = save['vocal'];
                if(currentInfo['bgm'] !== save['bgm']){
                    currentInfo['bgm'] = save['bgm'];
                    loadBGM();
                }
                playVocal();
                showTextArray(textArray,currentText);
                // currentText = currentText + 1;

                // currentSentence = currentSentence+1;
            }
        }
    }

}

function closeBacklog(){
    document.getElementById('backlog').style.display = 'none';
    document.getElementById('bottomBox').style.display = 'flex';
}

function showIntro(text){
    let i = 0;
    let IntroView =
        <div>
            <div className={"skipIntro"} onClick={()=>{
                if(introInterval)
                    clearInterval(introInterval);
                document.getElementById("intro").style.display = 'none';
                currentSentence = currentSentence+1;
                nextSentenceProcessor();
            }}>
                跳过
            </div>
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

function clearIntro(){
    document.getElementById("intro").style.display = 'none';
    currentSentence = currentSentence+1;
    nextSentenceProcessor();
}

function isMobile(){
    let info = navigator.userAgent;
    let agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPod", "iPad"];
    for(let i = 0; i < agents.length; i++){
        if(info.indexOf(agents[i]) >= 0) return true;
    }
    return false;
}

var hideTextStatus = false;
function hideTextBox(){
    let even = window.event || arguments.callee.caller.arguments[0];
    even.preventDefault();
    even.stopPropagation();//阻止事件冒泡
    if(!hideTextStatus){
        document.getElementById('bottomBox').style.display = 'none';
        hideTextStatus = true;
    }
}
function clickOnBack(){
    if(hideTextStatus){
        document.getElementById('bottomBox').style.display = 'flex';
        hideTextStatus = false;
    }else {
        nextSentenceProcessor();
    }
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

// 禁止F12
// document.onkeydown=function(e){
//         if(e.keyCode === 123){
//             e.returnValue=false
//             return false
//         }
//     }
// 禁止右键菜单以及选择文字
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  });
document.addEventListener('selectstart', function(e) {
  e.preventDefault();
  });



/**
 * 查询当前组件状态
 * @param {string | Array.<string> | undefined} widgets
 * @returns {boolean | Map.<string, boolean>}
 */
function queryWidgetState(widgets) {
    const name2query = new Map([
        ['TitleScreen', 'div#Title'],
        ['TextBox', 'div#bottomBox'],
        ['SaveScreen', 'div#Save'],
        ['LoadScreen', 'div#Load'],
        ['SettingScreen', 'div#settings'],
        ['BacklogScreen', 'div#backlog'],
        ['PanicScreen', 'div#panic-overlay'],
    ]);

    let reduce = false;
    if (typeof (widgets) === 'string') {
        widgets = [widgets,];
        reduce = true;
    }
    else if (widgets === undefined) {
        widgets = Array.from(name2query.keys())
    }

    let state_map = new Map();
    for (const wi of widgets) {
        const query = name2query.get(wi);
        if (query === undefined)
            throw new RangeError(`No widget named ${wi}.`);
        const ele = document.querySelector(query);
        let disp = ele.style.display;
        if (disp === '')
            disp = window.getComputedStyle(ele).display;
        state_map.set(wi, disp !== 'none');
    }

    if (reduce)
        state_map = state_map.values().next().value
    return state_map;
}


/**
 * 略过 ignore，检测 states 中所有组件是否均隐藏
 * @param {Map.<string, boolean>} states
 * @param {string | Array.<string> | undefined} ignore
 * @returns {boolean}
 */
function AllHiddenIgnore(states, ignore) {
    if (typeof (ignore) === 'string')
        ignore = [ignore,];
    else if (ignore === undefined)
        ignore = []
    for (const [key, value] of states) {
        if (value === true && !ignore.includes(key))
            return false;
    }
    return true;
}



// -------- 快捷键 --------

document.addEventListener('keydown', function (ev) {
    if (ev.isComposing || ev.defaultPrevented || ev.repeat)
        return;

    switch (ev.code) {
        // begin ctrl skip
        case 'ControlLeft':
        case 'ControlRight':
            {
                const state = queryWidgetState();
                // 「正在游戏」状态
                if (AllHiddenIgnore(state, 'TextBox')) {
                    fastNext();
                    ev.preventDefault();
                }
            }
            break;

        default:
            break;
    }
});


document.addEventListener('keyup', function (ev) {
    if (ev.isComposing || ev.defaultPrevented)
        return;

    switch (ev.code) {
        // end ctrl skip
        case 'ControlLeft':
        case 'ControlRight':
            {
                const state = queryWidgetState();
                // 「正在游戏」状态
                if (AllHiddenIgnore(state, 'TextBox')) {
                    fastNext();
                    ev.preventDefault();
                }
            }
            break;

        // advance text / confirm
        case 'Space':
        case 'Enter':
        case 'NumpadEnter':
            {
                const state = queryWidgetState();
                if (AllHiddenIgnore(state, 'TextBox')) {
                    // 文本框显示
                    if (state.get('TextBox'))
                        nextSentenceProcessor();
                    else {
                        document.querySelector('div#bottomBox').style.display = 'flex';
                        hideTextStatus = false;
                    }
                    ev.preventDefault();
                }
            }
            break;

        // auto mode
        case 'KeyA':
            {
                const state = queryWidgetState();
                if (AllHiddenIgnore(state, 'TextBox')) {
                    autoNext();
                    ev.preventDefault();
                }
            }
            break;

        // skip mode
        case 'KeyF':
            {
                const state = queryWidgetState();
                if (AllHiddenIgnore(state, 'TextBox')) {
                    fastNext();
                    ev.preventDefault();
                }
            }
            break;

        // replay voice
        case 'KeyV':
            {
                const state = queryWidgetState();
                if (AllHiddenIgnore(state, 'TextBox')) {
                    playVocal();
                    ev.preventDefault();
                }
            }
            break;

        // save dialog
        case 'KeyS':
            {
                const state = queryWidgetState();
                if (AllHiddenIgnore(state, ['TextBox', 'SaveScreen'])) {
                    if (state.get('SaveScreen'))
                        closeSave();
                    else
                        onSaveGame();
                    ev.preventDefault();
                }
            }
            break;

        // load dialog
        case 'KeyL':
            {
                const state = queryWidgetState();
                if (AllHiddenIgnore(state, ['TextBox', 'LoadScreen'])) {
                    if (state.get('LoadScreen'))
                        closeLoad();
                    else
                        onLoadGame();
                    ev.preventDefault();
                }
            }
            break;

        // settings dialog
        case 'KeyC':
            {
                const state = queryWidgetState();
                if (AllHiddenIgnore(state, ['TextBox', 'SettingScreen'])) {
                    if (state.get('SettingScreen'))
                        closeSettings();
                    else
                        onSetting();
                    ev.preventDefault();
                }
            }
            break;

        // open backlog
        case 'ArrowUp':
            {
                const state = queryWidgetState();
                // 已经打开 backlog 后不再拦截上键
                if (AllHiddenIgnore(state, 'TextBox')) {
                    showBacklog();
                    ev.preventDefault();
                }
            }
            break;

        // hide window
        case 'Delete':
            {
                if (AllHiddenIgnore(queryWidgetState(['TitleScreen', 'PanicScreen']))) {
                    const state = queryWidgetState(['TextBox', 'SaveScreen', 'LoadScreen', 'SettingScreen', 'BacklogScreen']);
                    // 「正在游戏」状态
                    if (AllHiddenIgnore(state, 'TextBox')) {
                        if (state.get('TextBox')) {
                            document.querySelector('div#bottomBox').style.display = 'none';
                            hideTextStatus = true;
                        }
                        else {
                            document.querySelector('div#bottomBox').style.display = 'flex';
                            hideTextStatus = false;
                        }
                    }
                    // 有其他窗口
                    else {
                        if (state.get('SaveScreen'))
                            closeSave();
                        if (state.get('LoadScreen'))
                            closeLoad();
                        if (state.get('SettingScreen'))
                            closeSettings();
                        if (state.get('BacklogScreen'))
                            closeBacklog()
                        // 紧急回避专用 ESC 键控制
                    }
                    ev.preventDefault();
                }
            }
            break;

        // panic button
        case 'Escape':
            {
                if (queryWidgetState('PanicScreen'))
                    hidePanic();
                else
                    showPanic('Yoozle');
                ev.preventDefault();
            }
            break;

        default:
            break;
    }
});



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

function hidePanic() {
    document.querySelector('div#panic-overlay').style.display = 'none';
}
