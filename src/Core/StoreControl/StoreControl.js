//初始化常量表
// eslint-disable-next-line no-lone-blocks
import {nextSentenceProcessor} from "../WG_core";
import {prefetcher} from '../util/PrefetchWrapper';
import pako from 'pako';
import logger from "../util/logger";
import axios from "axios";


let setAutoWaitTime = 1500;
let autoWaitTime = 1500;
let textShowWaitTime = 35;


//初始化游戏信息表
// eslint-disable-next-line no-lone-blocks

let GameInfo = {
    Game_name: 'WebGAL Demo', Game_key: 'WG_default', Title_img: 'Title.png', Title_bgm: '夏影.mp3', Loading_img: 'none'
}

let SettingsMap = {
    font_size: {
        'small': '150%', 'medium': '200%', 'large': '250%',
    }, play_speed: {
        'low': 55, 'medium': 35, 'fast': 20
    }
}


//初始化运行时变量表
// eslint-disable-next-line no-lone-blocks

let currentScene = '';
let auto = 0;
let fast = 0;
let onTextPreview = 0;
let showingText = false;
let hideTextStatus = false;
let temp_bgm_TitleToGameplay = '';
let currentPIXI = {};


// 初始化状态表
let currentInfo = {
    SceneName: '',//场景文件名
    SentenceID: 0,//语句ID
    bg_Name: '',//背景文件名
    fig_Name: '',//立绘_中 文件名
    fig_Name_left: '',//立绘_左 文件名
    fig_Name_right: '',//立绘_右 文件名
    showText: '',//文字
    showName: '',//人物名
    command: '',//语句指令
    choose: '',//选项列表
    vocal: '',//语音 文件名
    bgm: '',//背景音乐 文件名
    miniAvatar: '',//小头像
    saveTime: '',
    GameVar: {},
    bg_filter: '',
    bg_transform: '',
    pixiPerformList: []
}

// 初始化存档系统
let Saves = [];
let SaveBacklog = [];

// 初始化backlog存储表
let CurrentBacklog = [];

//初始化存读档页面记录
let currentSavePage = 0;
let currentLoadPage = 0;

// 初始化设置表
let Settings = {
    font_size: 'medium', play_speed: 'medium'
};

let runtime = {
    setAutoWaitTime,
    autoWaitTime,
    textShowWaitTime,
    GameInfo,
    currentScene,
    auto,
    fast,
    onTextPreview,
    showingText,
    hideTextStatus,
    currentInfo,
    Saves,
    SaveBacklog,
    CurrentBacklog,
    currentSavePage,
    currentLoadPage,
    Settings,
    temp_bgm_TitleToGameplay
}

function getRuntime() {
    return runtime;
}

function loadCookie() {
    if (localStorage.getItem(GameInfo['Game_key'])) {
        // let pre_process = document.cookie;
        // let fst = pre_process.split(';')[0];
        // let scd = document.cookie.slice(fst.length+1);
        let unzip = unzipStr(localStorage.getItem(GameInfo['Game_key']));
        let data = JSON.parse(unzip);
        Saves = data.SavedGame;
        SaveBacklog = data.SavedBacklog;
        currentSavePage = data.SP;
        currentLoadPage = data.LP;
        Settings = data.cSettings;
    }
}

function writeCookie() {
    let toCookie = {
        SavedGame: Saves, SavedBacklog: SaveBacklog, SP: currentSavePage, LP: currentLoadPage, cSettings: Settings
    }
    // console.log(JSON.stringify(toCookie));
    let gzip = zipStr(JSON.stringify(toCookie), {to: 'string'});
    localStorage.setItem(GameInfo['Game_key'], gzip);
    // document.cookie = JSON.stringify(toCookie);
}

function clearCookie() {
    let toCookie = {
        SavedGame: [], SavedBacklog: [], SP: 0, LP: 0, cSettings: {
            font_size: 'medium', play_speed: 'medium'
        }
    }
    let gzip = zipStr(JSON.stringify(toCookie), {to: 'string'});
    localStorage.setItem(GameInfo['Game_key'], gzip);
}

function loadSettings() {
    let fontSizeKey = Settings.font_size;
    let fontSize = SettingsMap.font_size[fontSizeKey];

    let playSpeedKey = Settings.play_speed;
    let playSpeed = SettingsMap.play_speed[playSpeedKey];

    document.getElementById('SceneText').style.fontSize = fontSize;
    textShowWaitTime = playSpeed;
}

function SyncCurrentStatus(statusKey, newStatus) {
    if (statusKey === 'all') {
        for (let StatusProp in newStatus) {
            if (currentInfo.hasOwnProperty(StatusProp)) {
                currentInfo[StatusProp] = newStatus[StatusProp];
            }
        }
    } else currentInfo[statusKey] = newStatus;
}

function getStatus(statusKey) {
    if (statusKey === 'all') return currentInfo; else return currentInfo[statusKey];
}

// 获取场景脚本
function getScene(url) {
    currentScene = '';

    let getScReq = null;
    getScReq = new XMLHttpRequest();
    logger.info('开始获取场景脚本')
    if (getScReq != null) {
        getScReq.open("get", url, true);
        getScReq.send();
        getScReq.onreadystatechange = doResult; //设置回调函数
    }

    function doResult() {
        if (getScReq.readyState === 4) { //4表示执行完成
            if (getScReq.status === 200) { //200表示执行成功
                currentScene = getScReq.responseText;
                currentScene = currentScene.split('\n');
                for (let i = 0; i < currentScene.length; i++) {
                    let tempSentence = currentScene[i].split(";")[0];
                    let commandLength = tempSentence.split(":")[0].length;
                    let command = currentScene[i].split(":")[0];
                    command = command.split(';')[0];
                    let content = tempSentence.slice(commandLength + 1);
                    currentScene[i] = currentScene[i].split(":");
                    currentScene[i][0] = command;
                    currentScene[i][1] = content;
                }
                logger.info('读取脚本完成',currentScene);
                getRuntime().currentScene = currentScene
                SyncCurrentStatus('SentenceID', 0);
                nextSentenceProcessor();
                prefetcher.onSceneChange(url);
            }
        }
    }

}

function getGameInfo() {
    let getInfoCon = new XMLHttpRequest();
    getInfoCon.onreadystatechange = function () {
        if (getInfoCon.status === 200) {
            let textList = getInfoCon.responseText;
            textList = textList.split('\n');
            for (let i = 0; i < textList.length; i++) {
                let tempStr = textList[i].split(";")[0];
                let temp = tempStr.split(':');
                if (temp[0] == null || temp[0] === '') continue;
                if (GameInfo.hasOwnProperty(temp[0])) {
                    GameInfo[temp[0]] = temp[1];
                } else {
                    console.warn('[GameInfo]', `\'${temp[0]}\' key in GameInfo is not exist.`);
                }
            }
            document.getElementById('Title').style.backgroundImage = 'url("./game/background/' + GameInfo["Title_img"] + '")';
            if (GameInfo["Loading_img"] !== 'none') document.getElementById('WG_startPage').style.backgroundImage = 'url("./game/background/' + GameInfo["Loading_img"] + '")';
            SyncCurrentStatus('bgm', GameInfo['Title_bgm']);
            // WG_ViewControl.loadBGM();
            document.title = GameInfo['Game_name'];
        }

    }
    getInfoCon.open('GET', 'game/config.txt');
    getInfoCon.send();
}

function unzipStr(b64Data) {
    let strData = atob(b64Data);
    const charData = strData.split('').map(function (x) {
        return x.charCodeAt(0);
    });
    const binData = new Uint8Array(charData);
    const data = pako.inflate(binData);
    strData = String.fromCharCode.apply(null, new Uint16Array(data));
    return decodeURIComponent(strData);
}

// 压缩
function zipStr(str) {
    const binaryString = pako.gzip(encodeURIComponent(str), {to: 'string'})
    return btoa(binaryString);
}

export {
    setAutoWaitTime,
    autoWaitTime,
    textShowWaitTime,
    GameInfo,
    currentScene,
    auto,
    fast,
    onTextPreview,
    showingText,
    hideTextStatus,
    currentInfo,
    Saves,
    SaveBacklog,
    CurrentBacklog,
    currentSavePage,
    currentLoadPage,
    Settings,
    SettingsMap,
    loadCookie,
    writeCookie,
    clearCookie,
    loadSettings,
    getStatus,
    getScene,
    getGameInfo,
    SyncCurrentStatus,
    getRuntime,
    currentPIXI
}