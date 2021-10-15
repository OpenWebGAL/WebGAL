import store, {act, actions} from "../store/store";

function KeyShortcut() {
    const name2query = new Map([
        ['TitleScreen', 'titleScreen'],
        ['TextBox', 'textBox'],
        ['SaveScreen', 'saveScreen'],
        ['LoadScreen', 'loadScreen'],
        ['SettingScreen', 'settingsScreen'],
        ['BacklogScreen', 'backlogScreen'],
        ['PanicScreen', 'panicScreen'],
    ]);

    /**
     * 查询当前组件状态
     * @param {string | Array.<string> | undefined?} widgets
     * @returns {boolean | Map.<string, boolean>}
     */
    function queryWidgetState(widgets) {
        let reduce = false;
        if (typeof (widgets) === 'string') {
            widgets = [widgets,];
            reduce = true;
        } else if (widgets === undefined) {
            widgets = Array.from(name2query.keys())
        }

        let state_map = new Map()
        for (let key of widgets) {
            let query = name2query.get(key)
            if (query === undefined)
                throw new RangeError(`No widget named ${key}.`);
            state_map.set(key, store.getState()[query]?.display || false)
        }

        if (reduce)
            state_map = state_map.values().next().value

        return state_map
    }

    /**
     * 略过 ignore，检测 states 中所有组件是否均隐藏
     * @param {Map.<string, boolean>} states
     * @param {string | Array.<string> | undefined?} ignore
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

    document.addEventListener('keyup', function (ev) {
        if (ev.isComposing || ev.defaultPrevented)
            return;

        switch (ev.code) {
            // end ctrl skip
            case 'ControlLeft':
            case 'ControlRight': {
                const state = queryWidgetState();
                // 「正在游戏」状态
                if (AllHiddenIgnore(state, 'TextBox')) {
                    act(actions.FAST_NEXT)
                    // fastNext();
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
                    if (state.get('TextBox'))
                        act(actions.NEXT_SENTENCE)
                    // nextSentenceProcessor();
                    else {
                        act(actions.SHOW_TEXT_BOX)
                        // document.querySelector('div#bottomBox').style.display = 'flex';
                        // hideTextStatus = false;
                    }
                    ev.preventDefault();
                }
            }
                break;

            // auto mode
            case 'KeyA': {
                const state = queryWidgetState();
                if (AllHiddenIgnore(state, 'TextBox')) {
                    act(actions.AUTO_NEXT)
                    // autoNext();
                    ev.preventDefault();
                }
            }
                break;

            // skip mode
            case 'KeyF': {
                const state = queryWidgetState();
                if (AllHiddenIgnore(state, 'TextBox')) {
                    act(actions.FAST_NEXT)
                    // fastNext();
                    ev.preventDefault();
                }
            }
                break;

            // replay voice
            case 'KeyV': {
                const state = queryWidgetState();
                if (AllHiddenIgnore(state, 'TextBox')) {
                    act(actions.PLAY_VOCAL)
                    // playVocal();
                    ev.preventDefault();
                }
            }
                break;

            // save dialog
            case 'KeyS': {
                const state = queryWidgetState();
                if (AllHiddenIgnore(state, ['TextBox', 'SaveScreen'])) {
                    if (state.get('SaveScreen'))
                        act(actions.HIDE_SAVE_SCREEN)
                    // closeSave();
                    else
                        act(actions.SHOW_SAVE_SCREEN)
                    // onSaveGame();
                    ev.preventDefault();
                }
            }
                break;

            // load dialog
            case 'KeyL': {
                const state = queryWidgetState();
                if (AllHiddenIgnore(state, ['TextBox', 'LoadScreen'])) {
                    if (state.get('LoadScreen'))
                        act(actions.HIDE_LOAD_SCREEN)
                    // closeLoad();
                    else
                        act(actions.SHOW_LOAD_SCREEN)
                    // onLoadGame();
                    ev.preventDefault();
                }
            }
                break;

            // settings dialog
            case 'KeyC': {
                const state = queryWidgetState();
                if (AllHiddenIgnore(state, ['TextBox', 'SettingScreen'])) {
                    if (state.get('SettingScreen'))
                        act(actions.HIDE_SETTINGS_SCREEN)
                    // closeSettings();
                    else
                        act(actions.SHOW_SETTINGS_SCREEN)
                    // onSetting();
                    ev.preventDefault();
                }
            }
                break;

            // open backlog
            case 'ArrowUp': {
                const state = queryWidgetState();
                // 已经打开 backlog 后不再拦截上键
                if (AllHiddenIgnore(state, 'TextBox')) {
                    act(actions.SHOW_BACKLOG_SCREEN)
                    // showBacklog();
                    ev.preventDefault();
                }
            }
                break;

            // open backlog
            case 'ArrowDown': {
                const state = queryWidgetState();
                console.log('ArrowDown')

                // 已经打开 backlog 后不再拦截上键
                if (AllHiddenIgnore(state, 'BacklogScreen')) {
                    act(actions.HIDE_BACKLOG_SCREEN)
                    // showBacklog();
                    ev.preventDefault();
                }
            }
                break;

            // hide window
            case 'Delete':
                if (AllHiddenIgnore(queryWidgetState(['TitleScreen', 'PanicScreen']))) {
                    const state = queryWidgetState(['TextBox', 'SaveScreen', 'LoadScreen', 'SettingScreen', 'BacklogScreen']);
                    // 「正在游戏」状态
                    if (AllHiddenIgnore(state, 'TextBox')) {
                        if (state.get('TextBox')) {
                            act(actions.HIDE_TEXT_BOX)
                            // document.querySelector('div#bottomBox').style.display = 'none';
                            // hideTextStatus = true;
                        } else {
                            act(actions.SHOW_TEXT_BOX)
                            // document.querySelector('div#bottomBox').style.display = 'flex';
                            // hideTextStatus = false;
                        }
                    }
                    // 有其他窗口
                    else {
                        if (state.get('SaveScreen'))
                            act(actions.HIDE_SAVE_SCREEN)
                        // closeSave();
                        if (state.get('LoadScreen'))
                            act(actions.HIDE_LOAD_SCREEN)
                        // closeLoad();
                        if (state.get('SettingScreen'))
                            act(actions.HIDE_SETTINGS_SCREEN)
                        // closeSettings();
                        if (state.get('BacklogScreen'))
                            act(actions.HIDE_BACKLOG_SCREEN)
                        // closeBacklog()
                        // 紧急回避专用 ESC 键控制
                    }
                    ev.preventDefault();
                }
                break;

            // panic button
            case 'Escape':
                if (queryWidgetState('PanicScreen'))
                    act(actions.HIDE_PANIC_SCREEN)
                // hidePanic();
                else
                    act(actions.SHOW_PANIC_SCREEN)
                // showPanic('Yoozle');
                ev.preventDefault();
                break;

            default:
                break;
        }
    });
}

export default KeyShortcut