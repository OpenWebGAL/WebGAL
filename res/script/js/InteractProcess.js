// 保存当前游戏状态
function saveGame(index){
    let tempInfo = JSON.stringify(currentInfo);
    Saves[index] = JSON.parse(tempInfo);
    let tempBacklog = JSON.stringify(CurrentBacklog);
    SaveBacklog[index]= JSON.parse(tempBacklog);
    writeCookie();
}

// 读取游戏存档
function LoadSavedGame(index) {
    closeLoad();
    VC_closeChoose();
    hideTitle('non-restart');
    let save = Saves[index];
    let url = 'game/scene/'
    url = url + save['SceneName'];
    currentScene ='';
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
                SyncCurrentStatus('SentenceID',save["SentenceID"]);
                VC_restoreStatus(save);
                CurrentBacklog = SaveBacklog[index];
                SyncCurrentStatus('all',save);
            }
        }
    }
}

//从回溯读取
function jumpFromBacklog(index) {
    closeBacklog();
    VC_closeChoose();
    let save = CurrentBacklog[index];
    for (let i = CurrentBacklog.length - 1 ; i > index-1 ; i--){
        CurrentBacklog.pop();
    }
    //get Scene:
    let url = 'game/scene/'
    url = url + save['SceneName'];
    currentScene ='';
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
                SyncCurrentStatus('SentenceID',save["SentenceID"]);
                VC_restoreStatus(save);
                SyncCurrentStatus('all',save);
                CurrentBacklog[CurrentBacklog.length] = JSON.parse(JSON.stringify(currentInfo));
            }
        }
    }

}

//从头开始游戏
function hideTitle(ifRes) {
    CurrentBacklog = [];
    document.getElementById('Title').style.display = 'none';
    if(ifRes !== 'non-restart'){
        currentInfo["bgm"] = '';
        loadBGM();
        currentInfo["fig_Name"] = '';
        currentInfo["fig_left"] = '';
        currentInfo["fig_right"] = '';
        VC_resetStage();
        getScene("game/scene/start.txt");
        currentInfo["SceneName"] = 'start.txt';
    }
}

// 分支选择（请求getScene）
function chooseScene(url){
    // console.log(url);
    currentInfo["SceneName"] = url;
    let sUrl = "game/scene/"+url;
    getScene(sUrl);
    document.getElementById("chooseBox").style.display="none"
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

// -------- 右键 --------

document.addEventListener('mouseup', function (ev) {
    if (ev.button === 2) {
        // 目前等功能同于 delete 键
        const evt = new KeyboardEvent('keyup', { key: 'Delete', code: 'Delete' });
        document.dispatchEvent(evt);
        ev.preventDefault();
    }
});

// -------- 滚轮 --------

document.addEventListener('wheel', function (ev) {
    const state = queryWidgetState();
    if (!(AllHiddenIgnore(state, 'TextBox') && state.get('TextBox')))
        return;
    // 「正在游戏」状态
    if (ev.deltaY > 0) {
        nextSentenceProcessor();
        ev.preventDefault();
    }
    else if (ev.deltaY < 0) {
        showBacklog();
        ev.preventDefault();
    }
});

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