//引擎加载完成
window.onload = function () {
    loadCookie();
    loadSettings();
    getGameInfo();
    if(isMobile()){
        MobileChangeStyle();
    }
}

// 保存当前游戏状态
function saveGame(index){
    let tempInfo = JSON.stringify(currentInfo);
    Saves[index] = JSON.parse(tempInfo);
    let tempBacklog = JSON.stringify(CurrentBacklog);
    SaveBacklog[index]= JSON.parse(tempBacklog);
    writeCookie();
}

//通过label跳分支
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
        SyncCurrentStatus('SentenceID',jmp_sentence);
        nextSentenceProcessor();
        document.getElementById("chooseBox").style.display="none"
    }else
    {
        increaseSentence();
        nextSentenceProcessor();
        document.getElementById("chooseBox").style.display="none"
    }
}

//点击背景
function clickOnBack(){
    if(hideTextStatus){
        document.getElementById('bottomBox').style.display = 'flex';
        hideTextStatus = false;
    }else {
        nextSentenceProcessor();
    }
}

// 打开设置
function onSetting(){
    loadCookie();
    VC_showSettings();
}

//打开读档菜单
function onLoadGame() {
    loadCookie();
    document.getElementById('Load').style.display = 'block';
    VC_showSave_Load('load');
}

//打开存档菜单
function onSaveGame() {
    loadCookie();
    document.getElementById('Save').style.display = 'block';
    VC_showSave_Load('save');
}

// 关闭设置
function closeSettings(){
    document.getElementById("settings").style.display = "none"
    document.getElementById("bottomBox").style.display = "flex"
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

// 关闭存档界面
function closeLoad() {
    document.getElementById('Load').style.display = 'none';
}

// 退出（试验中）
function exit(){
    showMesModel('你确定要退出吗','退出','留在本页',function (){window.close()})
}

// 回到标题界面
function Title() {
    showMesModel('要返回到标题界面吗','是','不要',function (){document.getElementById('Title').style.display = 'block';})
}

// Title页继续游戏
function continueGame(){
    if(currentScene === ''){
        getScene("game/scene/start.txt");
        currentInfo["SceneName"] = 'start.txt';
    }
    document.getElementById('Title').style.display = 'none';
}

// 关闭存档界面
function closeSave() {
    document.getElementById('Save').style.display = 'none';
}

// 关闭回溯界面
function closeBacklog(){
    document.getElementById('backlog').style.display = 'none';
    document.getElementById('bottomBox').style.display = 'flex';
}

// 关闭intro界面
function clearIntro(){
    document.getElementById("intro").style.display = 'none';
    increaseSentence();
    nextSentenceProcessor();
}

// 隐藏文本框
function hideTextBox(){
    let even = window.event || arguments.callee.caller.arguments[0];
    even.preventDefault();
    even.stopPropagation();//阻止事件冒泡
    if(!hideTextStatus){
        document.getElementById('bottomBox').style.display = 'none';
        hideTextStatus = true;
    }
}

// 关闭柚子搜索
function hidePanic() {
    document.querySelector('div#panic-overlay').style.display = 'none';
}




