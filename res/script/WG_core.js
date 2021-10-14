// 引擎加载完成
window.onload = function () {
    loadCookie();
    loadSettings();
    document.getElementById('Title').style.backgroundImage = 'url("./game/background/Title.png")';
    if(isMobile()){
        console.log("now is mobile view");
        document.getElementById('bottomBox').style.height = '45%';
        document.getElementById('TitleModel').style.height = '20%';
    }
}

//手机优化
function isMobile(){
    let info = navigator.userAgent;
    let agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPod", "iPad"];
    for(let i = 0; i < agents.length; i++){
        if(info.indexOf(agents[i]) >= 0) return true;
    }
    return false;
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

function closeLoad() {
    document.getElementById('Load').style.display = 'none';
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

function closeSave() {
    document.getElementById('Save').style.display = 'none';
}

function closeBacklog(){
    document.getElementById('backlog').style.display = 'none';
    document.getElementById('bottomBox').style.display = 'flex';
}

function clearIntro(){
    document.getElementById("intro").style.display = 'none';
    currentSentence = currentSentence+1;
    nextSentenceProcessor();
}

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

