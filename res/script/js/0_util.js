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
            SyncCurrentStatus("showName",currentScene[i][0]);
            return {name:getStatus('showName'),text:text,vocal:vocal};
        }
        else
        {
            let text = currentScene[i][0];
            if(currentScene[i][0].split('vocal-').length > 1){
                vocal = currentScene[i][0].split('vocal-')[1].split(',')[0];
                text = currentScene[i][0].split('vocal-')[1].slice(currentScene[i][0].split('vocal-')[1].split(',')[0].length+1);
            }
            return {name:getStatus('showName'),text:text,vocal:vocal};
        }


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
    document.getElementById('TitleModel').style.height = '20%';
}