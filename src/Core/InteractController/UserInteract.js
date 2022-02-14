import {
    Saves,
    SaveBacklog,
    CurrentBacklog,
    writeCookie,
    SyncCurrentStatus,
    getScene,
    loadCookie,
    getRuntime,
    getStatus,
    currentScene
} from "../StoreControl/StoreControl";
import {AllHiddenIgnore, queryWidgetState} from "../util/WG_util";
import * as core from "../WG_core"
import {WG_ViewControl} from "../ViewController/ViewControl";
import {prefetcher} from '../util/PrefetchWrapper';
import logger from "../util/logger";
// import AudioController from "../util/AudioController";


// eslint-disable-next-line no-self-assign

class userInteract {
// 保存当前游戏状态
    static saveGame(index) {
        logger.info("保存游戏，档位为 "+index);
        let tempInfo = JSON.stringify(getStatus("all"));
        Saves[index] = JSON.parse(tempInfo);
        let tempBacklog = JSON.stringify(getRuntime().CurrentBacklog);
        SaveBacklog[index] = JSON.parse(tempBacklog);
        Saves[index].saveTime = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString('chinese', {hour12: false});
        writeCookie();
    }

// 读取游戏存档
    static LoadSavedGame(index) {
        this.closeLoad();
        WG_ViewControl.VC_closeChoose();
        this.hideTitle('non-restart');
        let save = Saves[index];
        let url = 'game/scene/'
        url = url + save['SceneName'];
        getRuntime().currentScene = '';
        let getScReq = null;
        getScReq = new XMLHttpRequest();
        if (getScReq != null) {
            getScReq.open("get", url, true);
            getScReq.send();
            getScReq.onreadystatechange = doResult; //设置回调函数
        }

        function doResult() {
            if (getScReq.readyState === 4) { //4表示执行完成
                if (getScReq.status === 200) { //200表示执行成功
                    getRuntime().currentScene = getScReq.responseText;
                    getRuntime().currentScene = getRuntime().currentScene.split('\n');
                    for (let i = 0; i < getRuntime().currentScene.length; i++) {
                        let tempSentence = getRuntime().currentScene[i].split(";")[0];
                        let commandLength = tempSentence.split(":")[0].length;
                        let command = getRuntime().currentScene[i].split(":")[0];
                        let content = tempSentence.slice(commandLength + 1);
                        getRuntime().currentScene[i] = getRuntime().currentScene[i].split(":");
                        getRuntime().currentScene[i][0] = command;
                        getRuntime().currentScene[i][1] = content;
                    }
                    SyncCurrentStatus('SentenceID', save["SentenceID"]);
                    WG_ViewControl.VC_restoreStatus(save);
                    logger.info('读取的backlog为：',SaveBacklog)
                    getRuntime().CurrentBacklog = SaveBacklog[index];
                    SyncCurrentStatus('all', save);
                    prefetcher.onSceneChange(url, getStatus('SentenceID'));
                }
            }
        }
    }

//从回溯读取
    static jumpFromBacklog(index) {
        this.closeBacklog();
        WG_ViewControl.VC_closeChoose();
        let save = getRuntime().CurrentBacklog[index];
        for (let i = getRuntime().CurrentBacklog.length - 1; i > index - 1; i--) {
            getRuntime().CurrentBacklog.pop();
        }
        //get Scene:
        let url = 'game/scene/'
        url = url + save['SceneName'];
        getRuntime().currentScene = '';
        let getScReq = null;
        getScReq = new XMLHttpRequest();
        if (getScReq != null) {
            getScReq.open("get", url, true);
            getScReq.send();
            getScReq.onreadystatechange = doResult; //设置回调函数
        }

        function doResult() {
            if (getScReq.readyState === 4) { //4表示执行完成
                if (getScReq.status === 200) { //200表示执行成功
                    getRuntime().currentScene = getScReq.responseText;
                    getRuntime().currentScene = getRuntime().currentScene.split('\n');
                    for (let i = 0; i < getRuntime().currentScene.length; i++) {
                        let tempSentence = getRuntime().currentScene[i].split(";")[0];
                        let commandLength = tempSentence.split(":")[0].length;
                        let command = getRuntime().currentScene[i].split(":")[0];
                        let content = tempSentence.slice(commandLength + 1);
                        content = content.split(';')[0];
                        command = command.split(';')[0];
                        // noinspection JSValidateTypes
                        getRuntime().currentScene[i] = getRuntime().currentScene[i].split(":");
                        getRuntime().currentScene[i][0] = command;
                        getRuntime().currentScene[i][1] = content;
                    }
                    SyncCurrentStatus('SentenceID', save["SentenceID"]);
                    logger.info("从backlog中读取状态：",save);
                    WG_ViewControl.VC_restoreStatus(save);
                    SyncCurrentStatus('all', save);
                    getRuntime().CurrentBacklog[getRuntime().CurrentBacklog.length] = JSON.parse(JSON.stringify(getStatus("all")));
                    prefetcher.onSceneChange(url, getStatus('SentenceID'));
                }
            }
        }

    }

//从头开始游戏
    static hideTitle(ifRes) {
        getRuntime().CurrentBacklog = [];
        // CurrentBacklog = [];
        document.getElementById('Title').style.display = 'none';
        if (ifRes !== 'non-restart') {
            //隐藏选项界面
            document.getElementById("chooseBox").style.display = "none";
            getStatus("all")["bgm"] = '';
            WG_ViewControl.loadBGM();
            getStatus("all")["fig_Name"] = '';
            getStatus("all")["fig_left"] = '';
            getStatus("all")["fig_right"] = '';
            WG_ViewControl.VC_resetStage();
            getScene("game/scene/start.txt");
            getStatus("all")["SceneName"] = 'start.txt';
            getRuntime().currentInfo.bg_Name = 'none';
            //临时解决重新开始游戏后背景不清除的问题
            document.getElementById('mainBackground').style.backgroundImage = 'none';
            //在开始游戏时清除TITLE BGM(临时解决方案）
            // AudioController.loadAudioFile(AudioController.MAIN_BGM, null, true);
        }
        // WG_ViewControl.loadButton();
    }

// 分支选择（请求getScene）
    static chooseScene(url) {
        // console.log(url);
        getStatus("all")["SceneName"] = url;
        let sUrl = "game/scene/" + url;
        getScene(sUrl);
        document.getElementById("chooseBox").style.display = "none"
    }

//通过label跳分支
    static chooseJumpFun(label) {
        let lab_name = label;
        //find the line of the label:
        let find = false;
        let jmp_sentence = 0;
        for (let i = 0; i < getRuntime().currentScene.length; i++) {
            if (getRuntime().currentScene[i][0] === 'label' && getRuntime().currentScene[i][1] === lab_name) {
                find = true;
                jmp_sentence = i;
            }
        }
        if (find) {
            SyncCurrentStatus('SentenceID', jmp_sentence);
            core.nextSentenceProcessor();
            document.getElementById("chooseBox").style.display = "none"
        } else {
            core.increaseSentence();
            core.nextSentenceProcessor();
            document.getElementById("chooseBox").style.display = "none"
        }
    }

//点击背景
    static clickOnBack() {
        if (getRuntime().hideTextStatus) {
            document.getElementById('bottomBox').style.display = 'flex';
            getRuntime().hideTextStatus = false;
        } else {
            core.nextSentenceProcessor();
        }
    }

// 打开设置
    static onSetting() {
        loadCookie();
        WG_ViewControl.VC_showSettings();
        if (getRuntime().Settings["font_size"] === 'small') {
            document.getElementById('previewDiv').style.fontSize = '150%';
        } else if (getRuntime().Settings["font_size"] === 'medium') {
            document.getElementById('previewDiv').style.fontSize = '200%';
        } else if (getRuntime().Settings["font_size"] === 'large') {
            document.getElementById('previewDiv').style.fontSize = '250%';
        }
    }

//打开读档菜单
    static onLoadGame() {
        loadCookie();
        document.getElementById('Load').style.display = 'block';
        WG_ViewControl.VC_showSave_Load('load');
    }

//打开存档菜单
    static onSaveGame() {
        loadCookie();
        document.getElementById('Save').style.display = 'block';
        WG_ViewControl.VC_showSave_Load('save');
    }

// 关闭设置
    static closeSettings() {
        document.getElementById("settings").style.display = "none"
        document.getElementById("bottomBox").style.display = "flex"
    }

//自动播放
    static autoNext() {
        if (getRuntime().auto === 0) {
            getRuntime().autoWaitTime = getRuntime().setAutoWaitTime;
            getRuntime().textShowWaitTime = 35
            getRuntime().fast = 0;
            getRuntime().auto = 0;
            document.getElementById('autoButton').style.backgroundColor = 'rgba(255,255,255,0)';
            document.getElementById('autoButton').style.boxShadow = 'none';
            // console.log("notFast");
            getRuntime().autoWaitTime = getRuntime().setAutoWaitTime;
            getRuntime().auto = 1;
            document.getElementById('autoButton').style.backgroundColor = 'rgba(255,255,255,0.195)';
            document.getElementById('autoButton').style.boxShadow = '0 0 25px rgba(255,255,255,0.5)';
            // if(document.getElementById('currentVocal')&&fast === 0){
            //     let interval2 = setInterval(playNext,30)
            //     function playNext(){
            //         if(document.getElementById('currentVocal').ended){
            //             nextSentenceProcessor();
            //             clearInterval(interval2)
            //         }
            //     }
            // }else
            core.nextSentenceProcessor();
        } else if (getRuntime().auto === 1) {
            getRuntime().autoWaitTime = getRuntime().setAutoWaitTime;
            getRuntime().auto = 0;
            document.getElementById('autoButton').style.backgroundColor = 'rgba(255,255,255,0)';
            document.getElementById('autoButton').style.boxShadow = 'none';
            // console.log("notAuto");
        }
    }

// 快进
    static fastNext() {
        if (getRuntime().fast === 0) {
            getRuntime().autoWaitTime = getRuntime().setAutoWaitTime;
            getRuntime().auto = 0;
            document.getElementById('autoButton').style.backgroundColor = 'rgba(255,255,255,0)';
            document.getElementById('autoButton').style.boxShadow = 'none';
            // console.log("notAuto");
            getRuntime().autoWaitTime = 500;
            getRuntime().textShowWaitTime = 5;
            getRuntime().fast = 1;
            getRuntime().auto = 1;
            // console.log("fast");
            document.getElementById('fastButton').style.backgroundColor = 'rgba(255,255,255,0.195)';
            document.getElementById('fastButton').style.boxShadow = '0 0 25px rgba(255,255,255,0.5)';
            core.nextSentenceProcessor();

        } else if (getRuntime().fast === 1) {
            getRuntime().autoWaitTime = getRuntime().setAutoWaitTime;
            getRuntime().textShowWaitTime = 35
            getRuntime().fast = 0;
            getRuntime().auto = 0;
            document.getElementById('fastButton').style.backgroundColor = 'rgba(255,255,255,0)';
            document.getElementById('fastButton').style.boxShadow = 'none';
            // console.log("notFast");
        }
    }

// 关闭存档界面
    static closeLoad() {
        document.getElementById('Load').style.display = 'none';
    }

// 退出（试验中）
    static exit() {
        WG_ViewControl.showMesModel('你确定要退出吗', '退出', '留在本页', function () {
            window.close()
        })
    }

// 回到标题界面
    static Title() {
        WG_ViewControl.showMesModel('要返回到标题界面吗', '是', '不要', function () {
            document.getElementById('Title').style.display = 'block';
            getRuntime().temp_bgm_TitleToGameplay = getRuntime().currentInfo.bgm;
            SyncCurrentStatus('bgm', getRuntime().GameInfo['Title_bgm']);
            WG_ViewControl.loadBGM();
        })
    }

// Title页继续游戏
    static continueGame() {
        if (getRuntime().currentScene === '') {
            getScene("game/scene/start.txt");
            getStatus("all")["SceneName"] = 'start.txt';
        }
        document.getElementById('Title').style.display = 'none';
        // WG_ViewControl.loadButton();
        getRuntime().currentInfo.bgm = getRuntime().temp_bgm_TitleToGameplay;
        WG_ViewControl.loadBGM();
    }

// 关闭存档界面
    static closeSave() {
        document.getElementById('Save').style.display = 'none';
    }

// 关闭回溯界面
    static closeBacklog() {
        document.getElementById('backlog').style.display = 'none';
        document.getElementById('bottomBox').style.display = 'flex';
    }

// 关闭intro界面
    static clearIntro() {
        document.getElementById("intro").style.display = 'none';
        core.increaseSentence();
        core.nextSentenceProcessor();
    }

// 隐藏文本框
    static hideTextBox() {
        // let even = window.event || arguments.callee.caller.arguments[0];
        // even.preventDefault();
        // even.stopPropagation();//阻止事件冒泡
        if (!getRuntime().hideTextStatus) {
            document.getElementById('bottomBox').style.display = 'none';
            getRuntime().hideTextStatus = true;
        }
    }

// 关闭柚子搜索
    static hidePanic() {
        document.querySelector('div#panic-overlay').style.display = 'none';
    }


    static showBacklog() {
        // let even = window.event || arguments.callee.caller.arguments[0];
        // even.preventDefault();
        // even.stopPropagation();//阻止事件冒泡
        WG_ViewControl.showBacklog();
    }

    static hideStartPage() {
        document.getElementById("WG_startPage").style.display = 'none';
        WG_ViewControl.loadBGM();
        //设置默认动画
        WG_ViewControl.VC_setAnimationById('mainBackground', 'bg_softIn', '2s');
        WG_ViewControl.VC_setAnimationByClass('figureContainerleft', 'centerIn', '1s');
        WG_ViewControl.VC_setAnimationByClass('figureContainercenter', 'centerIn', '1s');
        WG_ViewControl.VC_setAnimationByClass('figureContainerright', 'centerIn', '1s');
    }
}


// 禁止F12
// document.onkeydown=function(e){
//         if(e.keyCode === 123){
//             e.returnValue=false
//             return false
//         }
//     }

// 禁止右键菜单以及选择文字
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});
document.addEventListener('selectstart', function (e) {
    e.preventDefault();
});

// -------- 右键 --------

document.addEventListener('mouseup', function (ev) {
    if (ev.button === 2) {
        // 目前等功能同于 delete 键
        const evt = new KeyboardEvent('keyup', {key: 'Delete', code: 'Delete'});
        document.dispatchEvent(evt);
        ev.preventDefault();
    }
});

// -------- 滚轮 --------

document.addEventListener('wheel', function (ev) {
    const state = queryWidgetState();
    if (!(AllHiddenIgnore(state, 'TextBox') && state.get('TextBox'))) return;
    // 「正在游戏」状态
    if (ev.deltaY > 0) {
        core.nextSentenceProcessor();
        ev.preventDefault();
    } else if (ev.deltaY < 0) {
        WG_ViewControl.showBacklog();
        ev.preventDefault();
    }
});

// -------- 快捷键 --------
document.addEventListener('keydown', function (ev) {
    if (ev.isComposing || ev.defaultPrevented || ev.repeat) return;

    switch (ev.code) {
        // begin ctrl skip
        case 'ControlLeft':
        case 'ControlRight': {
            const state = queryWidgetState();
            // 「正在游戏」状态
            if (AllHiddenIgnore(state, 'TextBox')) {
                userInteract.fastNext();
                ev.preventDefault();
            }
        }
            break;

        default:
            break;
    }
});
document.addEventListener('keyup', function (ev) {
    if (ev.isComposing || ev.defaultPrevented) return;

    switch (ev.code) {
        // end ctrl skip
        case 'ControlLeft':
        case 'ControlRight': {
            const state = queryWidgetState();
            // 「正在游戏」状态
            if (AllHiddenIgnore(state, 'TextBox')) {
                userInteract.fastNext();
                ev.preventDefault();
            }
        }
            break;

        // advance text / confirm
        case 'Space':
        case 'Enter':
        case 'NumpadEnter': {
            const state = queryWidgetState();
            if (AllHiddenIgnore(state, 'TextBox')) {
                // 文本框显示
                if (state.get('TextBox')) core.nextSentenceProcessor(); else {
                    document.querySelector('div#bottomBox').style.display = 'flex';
                    getRuntime().hideTextStatus = false;
                }
                ev.preventDefault();
            }
        }
            break;

        // auto mode
        case 'KeyA': {
            const state = queryWidgetState();
            if (AllHiddenIgnore(state, 'TextBox')) {
                userInteract.autoNext();
                ev.preventDefault();
            }
        }
            break;

        // skip mode
        case 'KeyF': {
            const state = queryWidgetState();
            if (AllHiddenIgnore(state, 'TextBox')) {
                userInteract.fastNext();
                ev.preventDefault();
            }
        }
            break;

        // replay voice
        case 'KeyV': {
            const state = queryWidgetState();
            if (AllHiddenIgnore(state, 'TextBox')) {
                WG_ViewControl.playVocal();
                ev.preventDefault();
            }
        }
            break;

        // save dialog
        case 'KeyS': {
            const state = queryWidgetState();
            if (AllHiddenIgnore(state, ['TextBox', 'SaveScreen'])) {
                if (state.get('SaveScreen')) userInteract.closeSave(); else userInteract.onSaveGame();
                ev.preventDefault();
            }
        }
            break;

        // load dialog
        case 'KeyL': {
            const state = queryWidgetState();
            if (AllHiddenIgnore(state, ['TextBox', 'LoadScreen'])) {
                if (state.get('LoadScreen')) userInteract.closeLoad(); else userInteract.onLoadGame();
                ev.preventDefault();
            }
        }
            break;

        // settings dialog
        case 'KeyC': {
            const state = queryWidgetState();
            if (AllHiddenIgnore(state, ['TextBox', 'SettingScreen'])) {
                if (state.get('SettingScreen')) userInteract.closeSettings(); else userInteract.onSetting();
                ev.preventDefault();
            }
        }
            break;

        // open backlog
        case 'ArrowUp': {
            const state = queryWidgetState();
            // 已经打开 backlog 后不再拦截上键
            if (AllHiddenIgnore(state, 'TextBox')) {
                WG_ViewControl.showBacklog();
                ev.preventDefault();
            }
        }
            break;

        // open title
        case 'KeyT': {
            const state = queryWidgetState();
            if (AllHiddenIgnore(state, ['TextBox', 'Title'])) {
                if (state.get('Title')) userInteract.continueGame(); else userInteract.Title();
                ev.preventDefault();
            }
        }
            break;

        // hide window
        case 'Delete': {
            if (AllHiddenIgnore(queryWidgetState(['TitleScreen', 'PanicScreen']))) {
                const state = queryWidgetState(['TextBox', 'SaveScreen', 'LoadScreen', 'SettingScreen', 'BacklogScreen']);
                // 「正在游戏」状态
                if (AllHiddenIgnore(state, 'TextBox')) {
                    if (state.get('TextBox')) {
                        document.querySelector('div#bottomBox').style.display = 'none';
                        getRuntime().hideTextStatus = true;
                    } else {
                        document.querySelector('div#bottomBox').style.display = 'flex';
                        getRuntime().hideTextStatus = false;
                    }
                }
                // 有其他窗口
                else {
                    if (state.get('SaveScreen')) userInteract.closeSave();
                    if (state.get('LoadScreen')) userInteract.closeLoad();
                    if (state.get('SettingScreen')) userInteract.closeSettings();
                    if (state.get('BacklogScreen')) userInteract.closeBacklog()
                    // 紧急回避专用 ESC 键控制
                }
                ev.preventDefault();
            }
        }
            break;

        // panic button
        case 'Escape': {
            if (queryWidgetState('PanicScreen')) userInteract.hidePanic(); else WG_ViewControl.showPanic('Yoozle');
            ev.preventDefault();
        }
            break;

        default:
            break;
    }
});

export {userInteract};