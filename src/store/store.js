import {combineReducers, createStore} from "redux";
import LocalStorageUtil from "../utils/LocalStorageUtil";

// 获取所有本地存储数据
let localData = LocalStorageUtil.loadData()

// 运行时状态属性
const runtimeState = {
    scene: {},
    saves: {},
    runtime: {
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
        currentText: 0,//当前文字ID
        vocal: '',//语音 文件名
        bgm: ''//背景音乐 文件名
    },
    tempState: {
        showingText: false
    },

    settingsScreen: {
        display: false,
        fontSize: 'small',
        playSpeed: 'slow'
    },

    titleScreen: {
        display: true,
        titleBgUrl: '/game/background/Title.png'
    },

    textBox: {
        display: true
    },

    panicScreen: {
        display: false
    },

    saveScreen: {
        display: false
    },

    loadScreen: {
        display: false
    },

    backlogScreen: {
        display: false
    }
}

// 获取本地存储数据，并赋值给runtimeState
if (localData != null) {
    Object.assign(runtimeState, localData)
}

// 定义一系列的Action
const actions = {
    SET_SCENE: "存储情景数据",
    CLEAR_SCENE: "清除情景数据",

    ADD_SAVES: '添加存档',
    DELETE_SAVES: '删除存档',
    CLEAR_SAVES: '清空运行时数据',

    SET_RUNTIME_SCENE_NAME: '设置请景文件名',
    SET_RUNTIME_SENTENCE_ID: '设置语句ID',
    SET_RUNTIME_BACKGROUND: '设置背景文件名',
    SET_RUNTIME_FIGURE_NAME_MIDDLE: '设置立绘_中',
    SET_RUNTIME_FIGURE_NAME_LEFT: '设置立绘_左',
    SET_RUNTIME_FIGURE_NAME_RIGHT: '设置立绘_右',
    SET_RUNTIME_SENTENCE_TEXT: '设置语句内容',
    SET_RUNTIME_SPEAKER_NAME: '设置说话者名字',
    SET_RUNTIME_COMMAND: '设置语句命令',
    SET_RUNTIME_CHOOSE: '设置选项列表',
    SET_RUNTIME_TEXT_ID: '设置当前文字ID',
    SET_RUNTIME_VOCAL: '设置语音文件名',
    SET_RUNTIME_BGM: '设置背景音乐文件名',
    SET_RUNTIME: '设置运行时数据',
    CLEAR_RUNTIME: '清空运行时数据',

    SET_TEMP_SHOWING_TEXT: '设置文字显示状态',

    SHOW_SETTINGS_SCREEN: "显示设置面板",
    HIDE_SETTINGS_SCREEN: "隐藏设置面板",
    CONTROL_SETTINGS_SCREEN: "控制设置面板",
    TOGGLE_SETTINGS_SCREEN: "切换显示设置面板",

    SHOW_TITLE_SCREEN: "显示标题界面",
    HIDE_TITLE_SCREEN: "隐藏标题界面",

    SHOW_PANIC_SCREEN: "显示隐蔽界面",
    HIDE_PANIC_SCREEN: "隐藏隐蔽界面",

    SHOW_SAVE_SCREEN: "显示保存界面",
    HIDE_SAVE_SCREEN: "隐藏保存界面",

    SHOW_LOAD_SCREEN: "显示读取界面",
    HIDE_LOAD_SCREEN: "隐藏读取界面",

    SHOW_BACKLOG_SCREEN: "显示回溯界面",
    HIDE_BACKLOG_SCREEN: "隐藏回溯界面",
    HANDLE_BACKLOG_SELECTED: "处理选中事件",

    SHOW_TEXT_BOX: "显示文本容器",
    HIDE_TEXT_BOX: "隐藏文本容器",

    FAST_NEXT: "快进",
    AUTO_NEXT: "自动播放",
    PLAY_VOCAL: "播放语音",

    NEXT_SENTENCE: "下一句",

    FONT_SIZE_SELECTION: ['small', 'medium', 'large'],
    PLAY_SPEED_SELECTION: ['slow', 'medium', 'fast'],
}

const sceneReducer = (state = runtimeState.scene, action) => {
    let temp = {...state}

    // eslint-disable-next-line default-case
    switch (action.type) {
        case actions.SET_SCENE:
            if (action.payload != null) {
                Object.assign(temp, action.payload)
            }
            break
        case actions.CLEAR_SCENE:
            return {}
    }

    return temp
}

const runtimeReducer = (state = runtimeState.runtime, action) => {
    let temp = {...state}

    // eslint-disable-next-line default-case
    switch (action.type) {
        case actions.SET_RUNTIME_SCENE_NAME:
            Object.assign(temp, {SceneName: action.payload})
            break
        case actions.SET_RUNTIME_SENTENCE_ID:
            Object.assign(temp, {SentenceID: action.payload})
            break
        case actions.SET_RUNTIME_BACKGROUND:
            Object.assign(temp, {bg_Name: action.payload})
            break
        case actions.SET_RUNTIME_FIGURE_NAME_MIDDLE:
            Object.assign(temp, {fig_Name: action.payload})
            break
        case actions.SET_RUNTIME_FIGURE_NAME_LEFT:
            Object.assign(temp, {fig_Name_left: action.payload})
            break
        case actions.SET_RUNTIME_FIGURE_NAME_RIGHT:
            Object.assign(temp, {fig_Name_right: action.payload})
            break
        case actions.SET_RUNTIME_SENTENCE_TEXT:
            Object.assign(temp, {showText: action.payload})
            break
        case actions.SET_RUNTIME_SPEAKER_NAME:
            Object.assign(temp, {showName: action.payload})
            break
        case actions.SET_RUNTIME_COMMAND:
            Object.assign(temp, {command: action.payload})
            break
        case actions.SET_RUNTIME_CHOOSE:
            Object.assign(temp, {choose: action.payload})
            break
        case actions.SET_RUNTIME_TEXT_ID:
            Object.assign(temp, {currentText: action.payload})
            break
        case actions.SET_RUNTIME_VOCAL:
            Object.assign(temp, {vocal: action.payload})
            break
        case actions.SET_RUNTIME_BGM:
            Object.assign(temp, {bgm: action.payload})
            break
        case actions.SET_RUNTIME:
            Object.assign(temp, action.payload)
            break
        case actions.CLEAR_RUNTIME:
            Object.keys(temp).forEach(key => temp[key] = '')
            break
    }
    return temp
}

const SavesReducer = (state = runtimeState.saves, action) => {
    let temp = {...state}

    // eslint-disable-next-line default-case
    switch (action.type) {
        case actions.ADD_SAVES:
            if (action?.payload != null) {
                if (action?.extra != null) {
                    temp[action?.extra] = action.payload
                }
            }
            break
        case actions.CLEAR_SAVES:
            return []
    }
    return temp
}

const tempStateReducer = (state = runtimeState.tempState, action) => {
    let temp = {...state}

    // eslint-disable-next-line default-case
    switch (action.type) {
        case actions.SET_TEMP_SHOWING_TEXT:
            Object.assign(temp, {showingText: action.payload || false})
            break
    }
    return temp
}

// 处理settings_panel相关的Action
const settingsScreenReducer = (state = runtimeState.settingsScreen, action) => {
    let temp = {...state}

    // eslint-disable-next-line default-case
    switch (action.type) {
        case actions.CONTROL_SETTINGS_SCREEN:
            Object.assign(temp, {display: action.payload || false})
            break
        case actions.SHOW_SETTINGS_SCREEN:
            Object.assign(temp, {display: true})
            break
        case actions.HIDE_SETTINGS_SCREEN:
            Object.assign(temp, {display: false})
            break
        case actions.TOGGLE_SETTINGS_SCREEN:
            Object.assign(temp, {display: !temp.display})
            break
        case actions.FONT_SIZE_SELECTION:
            Object.assign(temp, {fontSize: actions.FONT_SIZE_SELECTION[action.payload || 0]})
            break
        case actions.PLAY_SPEED_SELECTION:
            Object.assign(temp, {playSpeed: actions.PLAY_SPEED_SELECTION[action.payload || 0]})
            break
    }
    return temp
}

const titleScreenReducer = (state = runtimeState.titleScreen, action) => {
    let temp = {...state}

    // eslint-disable-next-line default-case
    switch (action.type) {
        case actions.SHOW_TITLE_SCREEN:
            Object.assign(temp, {display: true})
            break
        case actions.HIDE_TITLE_SCREEN:
            Object.assign(temp, {display: false})
            break
    }
    return temp
}

const textBoxReducer = (state = runtimeState.textBox, action) => {
    let temp = {...state}

    // eslint-disable-next-line default-case
    switch (action.type) {
        case actions.SHOW_TEXT_BOX:
            Object.assign(temp, {display: true})
            break
        case actions.HIDE_TEXT_BOX:
            Object.assign(temp, {display: false})
            break
    }
    return temp
}

const saveScreenReducer = (state = runtimeState.saveScreen, action) => {
    let temp = {...state}

    // eslint-disable-next-line default-case
    switch (action.type) {
        case actions.SHOW_SAVE_SCREEN:
            Object.assign(temp, {display: true})
            break
        case actions.HIDE_SAVE_SCREEN:
            Object.assign(temp, {display: false})
            break
    }
    return temp
}

const loadScreenReducer = (state = runtimeState.loadScreen, action) => {
    let temp = {...state}

    // eslint-disable-next-line default-case
    switch (action.type) {
        case actions.SHOW_LOAD_SCREEN:
            Object.assign(temp, {display: true})
            break
        case actions.HIDE_LOAD_SCREEN:
            Object.assign(temp, {display: false})
            break
    }
    return temp
}

const backlogScreenReducer = (state = runtimeState.backlogScreen, action) => {
    let temp = {...state}

    // eslint-disable-next-line default-case
    switch (action.type) {
        case actions.SHOW_BACKLOG_SCREEN:
            Object.assign(temp, {display: true})
            break
        case actions.HIDE_BACKLOG_SCREEN:
            Object.assign(temp, {display: false})
            break
        case actions.HANDLE_BACKLOG_SELECTED:
            Object.assign(temp, {display: false})
    }
    return temp
}

const panicScreenReducer = (state = runtimeState.panicScreen, action) => {
    let temp = {...state}

    // eslint-disable-next-line default-case
    switch (action.type) {
        case actions.SHOW_PANIC_SCREEN:
            Object.assign(temp, {display: true})
            break
        case actions.HIDE_PANIC_SCREEN:
            Object.assign(temp, {display: false})
            break
    }
    return temp
}

// 根据属性，合并多个子Reducer，形成最终输出的State
const reducers = combineReducers({
    scene: sceneReducer,
    saves: SavesReducer,
    runtime: runtimeReducer,
    tempState: tempStateReducer,
    textBox: textBoxReducer,
    settingsScreen: settingsScreenReducer,
    titleScreen: titleScreenReducer,
    backlogScreen: backlogScreenReducer,
    panicScreen: panicScreenReducer,
    saveScreen: saveScreenReducer,
    loadScreen: loadScreenReducer,
})

const store = createStore(reducers)

// 设置需要忽略不保存进LocalStorage的属性，
// const ignored = ["scene"]
const ignored = ["tempState"]

saveState()
store.subscribe(saveState)

function saveState() {
    let temp = {...store.getState()}
    ignored.forEach(value => delete temp[value])
    LocalStorageUtil.saveData(temp)
}

/**
 *  向store发送action
 * @param {string} type
 * @param {Object|string|number|undefined?} payload
 * @param {Object|string|number|undefined?} extra
 */
const act = (type, payload, extra) => {
    store.dispatch({type: type, payload: payload, extra: extra})
}

export {store, actions, act}
export default store