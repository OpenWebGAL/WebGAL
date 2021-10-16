//初始化常量表
{
    var setAutoWaitTime = 1500;
    var autoWaitTime = 1500;
    var textShowWatiTime = 35;
}

//初始化游戏信息表
{
    var GameInfo =
        {
            GameName:'WebGAL Demo',
            Game_key:'WG_default',
            Title_img:'Title.png',
            Title_bgm:'夏影.mp3'
        }
}

//初始化运行时变量表
{
    var currentScene ='';
    var auto = 0;
    var fast = 0;
    var onTextPreview = 0;
    var showingText = false;
    var hideTextStatus = false;
}

// 初始化状态表
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
    vocal:'',//语音 文件名
    bgm:''//背景音乐 文件名
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
    if(localStorage.getItem(GameInfo['Game_key'])){
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
    localStorage.setItem(GameInfo['Game_key'],JSON.stringify(toCookie));
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

function SyncCurrentStatus(statusKey,newStatus) {
    if(statusKey ==='all')
        currentInfo = newStatus;
    else
        currentInfo[statusKey] = newStatus;
}

function getStatus(statusKey){
    if(statusKey ==='all')
        return currentInfo;
    else
        return currentInfo[statusKey];
}

function increaseSentence(){
    SyncCurrentStatus('SentenceID',getStatus('SentenceID')+1);
}

function getGameInfo() {
    let getInfoCon = new XMLHttpRequest();
    getInfoCon.onreadystatechange = function (){
        if(getInfoCon.status === 200){
            let textList = getInfoCon.responseText;
            textList = textList.split('\n');
            for (let i = 0; i < textList.length; i++) {
                let temp = textList[i].split(':');
                temp[1] = temp[1].split(';')[0];
                switch (temp[0]) {
                    case 'GameName':
                        GameInfo['GameName'] = temp[1];
                        break;
                    case 'Game_key':
                        GameInfo['Game_key'] = temp[1];
                        break;
                    case 'Title_img':
                        GameInfo['Title_img'] = temp[1];
                        break;
                    case 'Title_bgm':
                        GameInfo['Title_bgm'] = temp[1];
                        break;
                }
            }
            document.getElementById('Title').style.backgroundImage = 'url("./game/background/'+GameInfo["Title_img"]+'")';
            SyncCurrentStatus('bgm',GameInfo['Title_bgm']);
            loadBGM();
            document.title = GameInfo['GameName'];
        }

    }
    getInfoCon.open('GET','game/config.txt');
    getInfoCon.send();
}