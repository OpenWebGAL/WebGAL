
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

// 分支选择（请求getScene）
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