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
        SceneName:'',
        SentenceID:0,
        bg_Name:'',
        fig_Name:'',
        showText:'',
        showName:'',
        command:'',
        choose:'',
        currentText:0
    }
    var onTextPreview = 0;
}

// 初始化存档系统
var Saves=[];

//初始化需要记录到cookie的变量
var currentSavePage = 0;
var currentLoadPage = 0;

// 初始化设置表
var Settings = {
    font_size: 'medium',
    play_speed:'medium'
};

function loadCookie(){
    if(document.cookie){
        // let pre_process = document.cookie;
        // let fst = pre_process.split(';')[0];
        // let scd = document.cookie.slice(fst.length+1);
        let data = JSON.parse(document.cookie);
        Saves = data.SavedGame;
        currentSavePage = data.SP;
        currentLoadPage  = data.LP;
        Settings = data.cSettings;
    }
}

function writeCookie(){
    var expire = new Date((new Date()).getTime() + 20000 * 24 * 60 * 60000);//有效期20000天
    expire = ";expires=" + expire.toGMTString();
    let toCookie = {
        SavedGame:Saves,
        SP:currentSavePage,
        LP:currentLoadPage,
        cSettings:Settings
    }
    console.log(JSON.stringify(toCookie)+expire);
    document.cookie = JSON.stringify(toCookie)+expire;
}

function clearCookie(){
    let toCookie = {
        SavedGame:[],
        SP:0,
        LP:0,
        cSettings:{
            font_size: 'medium',
            play_speed:'medium'
        }
    }
    document.cookie = JSON.stringify(toCookie);
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
                if (save["fig_Name"] === ''){
                    ReactDOM.render(<div/>,document.getElementById('figureImage'));
                }else{
                    let pUrl = "game/figure/"+save["fig_Name"];
                    let changedP = <img src={pUrl} alt='figure' className='p_center'/>
                    // console.log('now changing person');
                    ReactDOM.render(changedP,document.getElementById('figureImage'));
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
                showTextArray(textArray,currentText);
                // currentText = currentText + 1;

                // currentSentence = currentSentence+1;
            }
        }
    }


}

// 保存当前游戏状态
function saveGame(index){
    let tempInfo = JSON.stringify(currentInfo);
    Saves[index] = JSON.parse(tempInfo);
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
window.onload = function (){
    loadCookie();
    loadSettings();
    document.getElementById('Title').style.backgroundImage = 'url("./game/background/Title.png")';
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
        return {name:currentScene[i][0],text:currentScene[i][1]};
}

// 读取下一条脚本
function nextSentenceProcessor() {

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
    else {
        currentInfo["command"] = processSentence(currentSentence)['name'];
        currentInfo["showName"] = processSentence(currentSentence)['name'];
        currentInfo["showText"] = processSentence(currentSentence)['text'];
        let changedName = <span>{processSentence(currentSentence)['name']}</span>
        let textArray = processSentence(currentSentence)['text'].split("");
        // let changedText = <p>{processSentence(currentSentence)['text']}</p>
        ReactDOM.render(changedName, document.getElementById('pName'));
        showTextArray(textArray,currentText+1);
        currentText = currentText + 1;
        currentInfo["currentText"] = currentText;
    }
    currentSentence = currentSentence+1;
    currentInfo["SentenceID"] = currentSentence;

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
    ReactDOM.render(<span> </span>, document.getElementById('SceneText'));
    let elementArray = [];
    let i = 0;
    clearInterval(interval);
    var interval = setInterval(showSingle,textShowWatiTime);
    // console.log("now: "+now+" currentText: "+currentText)
    function showSingle() {
        let tempElement = <span key={i} className='singleWord'>{textArray[i]}</span>
        elementArray.push(tempElement);
        if(currentText === now)
            ReactDOM.render(<div>{elementArray}</div>, document.getElementById('SceneText'));
        i = i+1;
        if(i > textArray.length +(autoWaitTime/35) || currentText!== now){
            clearInterval(interval);
            if(auto === 1&&currentText === now){
                nextSentenceProcessor();
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
    document.getElementById('Title').style.display = 'none';
    if(ifRes !== 'non-restart'){
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