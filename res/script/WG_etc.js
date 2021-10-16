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