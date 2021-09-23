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
}

// 初始化存档系统
var Saves=[];

// 读取游戏存档
function LoadSavedGame(index) {
    let save = Saves[index];
    //get Scene:
    let url = '/game/scene/'
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
                console.log('Read scene complete.');
                // console.log(currentScene);
                currentSentence = save["SentenceID"];
                currentText = save["SentenceID"];
                console.log("start:"+currentSentence)

                //load saved scene:
                let command = save["command"];
                console.log('readSaves:'+command)
                document.getElementById('mainBackground').style.backgroundImage = "url('game/background/" + save["bg_Name"] + "')";
                if (save["fig_Name"] === 'none'){
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
}

// 获取场景脚本
function getScene(url) {
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
                console.log('Read scene complete.');
                // console.log(currentScene);
                currentSentence = 0;
                console.log("start:"+currentSentence)
                nextSentenceProcessor();
            }
        }
    }

}

// 引擎加载完成
window.onload = function (){
    getScene("game/scene/start.txt");
    currentInfo["SceneName"] = 'start.txt';
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
    console.log(command)
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
    console.log("now: "+now+" currentText: "+currentText)
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

// 打开设置
function onSetting(){
    let settingInterface = <div>
        <div className="singleSettingItem">
            <span className="settingItemTitle">字体大小</span>
            <span className='settingItemButton'>小</span>
            <span className='settingItemButton'>中</span>
            <span className='settingItemButton'>大</span>
        </div>
        <div className="singleSettingItem">
            <span className="settingItemTitle">文字显示速度</span>
            <span className='settingItemButton'>慢</span>
            <span className='settingItemButton'>中</span>
            <span className='settingItemButton'>快</span>
        </div>
    </div>
    document.getElementById("settings").style.display = "flex"
    document.getElementById("bottomBox").style.display = "none"
    ReactDOM.render(settingInterface,document.getElementById("settingItems"))
}

// 关闭设置
function closeSettings(){
    document.getElementById("settings").style.display = "none"
    document.getElementById("bottomBox").style.display = "flex"
}

// 分支选择
function chooseScene(url){
    console.log(url);
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
        console.log("notFast");
        autoWaitTime = setAutoWaitTime;
        auto = 1;
        console.log("auto");
        document.getElementById('autoButton').style.backgroundColor = 'rgba(255,255,255,0.8)';
        document.getElementById('autoButton').style.color = '#8E354A';
        nextSentenceProcessor();

    }
    else if(auto === 1){
        autoWaitTime = setAutoWaitTime;
        auto = 0;
        document.getElementById('autoButton').style.backgroundColor = 'rgba(255,255,255,0)';
        document.getElementById('autoButton').style.color = 'white';
        console.log("notAuto");
    }
}

// 快进
function fastNext(){
    if(fast === 0){
        autoWaitTime = setAutoWaitTime;
        auto = 0;
        document.getElementById('autoButton').style.backgroundColor = 'rgba(255,255,255,0)';
        document.getElementById('autoButton').style.color = 'white';
        console.log("notAuto");
        autoWaitTime = 500;
        textShowWatiTime = 5;
        fast = 1;
        auto = 1;
        console.log("fast");
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
        console.log("notFast");
    }
}