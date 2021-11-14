import {getRuntime} from "../StoreControl/StoreControl";
import {SyncCurrentStatus,getStatus} from "../StoreControl/StoreControl";

// 处理脚本


function processSentence(i){
    if(i<getRuntime().currentScene.length)
    {
        let vocal = '';
        if(getRuntime().currentScene[i][1] !== '')
        {
            let text = getRuntime().currentScene[i][1];
            if(getRuntime().currentScene[i][1].split('vocal-').length > 1)
            {
                vocal = getRuntime().currentScene[i][1].split('vocal-')[1].split(',')[0];
                text = getRuntime().currentScene[i][1].split('vocal-')[1].slice(getRuntime().currentScene[i][1].split('vocal-')[1].split(',')[0].length+1);
            }
            SyncCurrentStatus("showName",getRuntime().currentScene[i][0]);
            return {name:getStatus('showName'),text:text,vocal:vocal};
        }
        else
        {
            let text = getRuntime().currentScene[i][0];
            if(getRuntime().currentScene[i][0].split('vocal-').length > 1){
                vocal = getRuntime().currentScene[i][0].split('vocal-')[1].split(',')[0];
                text = getRuntime().currentScene[i][0].split('vocal-')[1].slice(getRuntime().currentScene[i][0].split('vocal-')[1].split(',')[0].length+1);
                text = text.split(";")[0];
            }
            return {name:getStatus('showName'),text:text,vocal:vocal};
        }


    }

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

function loadSettings(){
    if(getRuntime().Settings["font_size"] === 'small'){
        document.getElementById('SceneText').style.fontSize = '150%';
    }else if(getRuntime().Settings["font_size"] === 'medium'){
        document.getElementById('SceneText').style.fontSize = '200%';
    }else if(getRuntime().Settings["font_size"] === 'large'){
        document.getElementById('SceneText').style.fontSize = '250%';
    }

    if(getRuntime().Settings["play_speed"] === 'low'){
        getRuntime().textShowWaitTime = 150;
    } else if(getRuntime().Settings["play_speed"] === 'medium'){
        getRuntime().textShowWaitTime = 50;
    }else if(getRuntime().Settings["play_speed"] === 'fast'){
        getRuntime().textShowWaitTime = 10;
    }
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

//手机优化
function isMobile(){
    let info = navigator.userAgent;
    let agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPod", "iPad"];
    for(let i = 0; i < agents.length; i++){
        if(info.indexOf(agents[i]) >= 0) return true;
    }
    return false;
}
function MobileChangeStyle(){
    console.log("now is mobile view");
    document.getElementById('bottomBox').style.height = '45%';
    document.getElementById('ReactRoot').style.fontSize = '65%';
    document.getElementById('mainTextWindow').style.padding = '5px 20% 5px 20%';
    document.getElementById('SceneText').style.padding = '5px 0 0 0';
}

export {processSentence,queryWidgetState,loadSettings,AllHiddenIgnore,isMobile,MobileChangeStyle}