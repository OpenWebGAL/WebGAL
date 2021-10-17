import Store, {act, actions} from "../store/Store";
import GamePlay from "../core/GamePlay";
import {uiActions} from "../store/UiStore";

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
            state_map.set(key, Store.getState()[query]?.display || false)
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
                        GamePlay.nextSentenceProcessor()
                    // nextSentenceProcessor();
                    else {
                        act(uiActions.SET_TEXT_BOX, true)
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
                    act(uiActions.SET_SAVE_SCREEN, !state.get('SaveScreen'))
                    ev.preventDefault();
                }
            }
                break;

            // load dialog
            case 'KeyL': {
                const state = queryWidgetState();
                if (AllHiddenIgnore(state, ['TitleScreen', 'TextBox', 'LoadScreen'])) {
                    act(uiActions.SET_LOAD_SCREEN, !state.get('LoadScreen'))
                    ev.preventDefault();
                }
            }
                break;

            // settings dialog
            case 'KeyC': {
                const state = queryWidgetState();
                if (AllHiddenIgnore(state, ['TitleScreen', 'TextBox', 'SettingScreen'])) {
                    act(uiActions.SET_SETTINGS_SCREEN, !state.get('SettingScreen'))
                    ev.preventDefault();
                }
            }
                break;

            // open backlog
            case 'ArrowUp': {
                const state = queryWidgetState();
                // 已经打开 backlog 后不再拦截上键
                if (AllHiddenIgnore(state, 'TextBox')) {
                    act(uiActions.SET_BACKLOG_SCREEN, true)
                    ev.preventDefault();
                }
            }
                break;

            // open backlog
            case 'ArrowDown': {
                const state = queryWidgetState();
                console.log('ArrowDown')

                // 已经打开 backlog 后不再拦截上键
                if (AllHiddenIgnore(state, ['TextBox', 'BacklogScreen'])) {
                    act(uiActions.SET_BACKLOG_SCREEN, false)
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
                        act(uiActions.SET_TEXT_BOX, !state.get('TextBox'))
                    }
                    // 有其他窗口
                    else {
                        act(uiActions.SET_SAVE_SCREEN, false)
                        act(uiActions.SET_LOAD_SCREEN, false)
                        act(uiActions.SET_SETTINGS_SCREEN, false)
                        act(uiActions.SET_BACKLOG_SCREEN, false)
                    }
                    ev.preventDefault();
                }
                break;

            // panic button
            case 'Escape':
                act(uiActions.SET_PANIC_SCREEN, !queryWidgetState('PanicScreen'))
                ev.preventDefault();
                break;

            default:
                break;
        }
    });
}

export default KeyShortcut