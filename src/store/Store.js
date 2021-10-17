import {combineReducers, createStore} from "redux";
import LocalStorageUtil from "../utils/LocalStorageUtil";
import UiReducer, {uiStoreKey} from "./UiStore";
import CurrentInfoReducer, {currentInfoStoreKey} from "./CurrentInfoStore";

// 获取所有本地存储数据
let localData = LocalStorageUtil.loadData()

// 运行时状态属性
const runtimeState = {
    scene: {},
    saves: {},
    temp: {
        isShowingText: false,
        fastNext: false,
        autoPlay: false,
    },
    settings: {
        playSpeed: 'medium',
        fontSize: 'medium'
    },
}

// 获取本地存储数据，并赋值给runtimeState
if (localData != null) Object.assign(runtimeState, localData)

// 定义一系列的Action
const actions = {
    SET_SCENE: "存储情景数据",
    CLEAR_SCENE: "清除情景数据",

    ADD_SAVES: '添加存档',
    CLEAR_SAVES: '清空存档数据',

    SET_TEMP_IS_SHOWING_TEXT: 'isShowingText',
    SET_TEMP_FAST_NEXT: "fastNext",
    SET_TEMP_AUTO_NEXT: "autoPlay",

    FONT_SIZE_SELECTION: ['small', 'medium', 'large'],
    PLAY_SPEED_SELECTION: ['slow', 'medium', 'fast'],
}

const sceneReducer = (state = runtimeState.scene, action) => {

    // eslint-disable-next-line default-case
    switch (action.type) {
        case actions.SET_SCENE:
            if (action.payload == null) return state
            Object.assign(state, action.payload)
            break
        case actions.CLEAR_SCENE:
            return {}
    }

    return state
}

const SavesReducer = (state = runtimeState.saves, action) => {
    if (action.payload === null || action.extra === null) return state
    let temp = {...state}

    // eslint-disable-next-line default-case
    switch (action.type) {
        case actions.ADD_SAVES:
            temp[action.extra] = action.payload
            break
        case actions.CLEAR_SAVES:
            return {}
    }
    return temp
}

const tempReducer = (state = runtimeState.temp, action) => {
    let temp = {...state}

    // eslint-disable-next-line default-case
    switch (action.type) {
        case actions.SET_TEMP_IS_SHOWING_TEXT:
        case actions.SET_TEMP_FAST_NEXT:
        case actions.SET_TEMP_AUTO_NEXT:
            temp[action.type] = action.payload
            break
    }
    return temp
}

const SettingsReducer = (state = runtimeState.settings, action) => {
    if (action?.payload === null) return state

    // eslint-disable-next-line default-case
    switch (action.type) {
        case actions.PLAY_SPEED_SELECTION:
            state["playSpeed"] = actions.PLAY_SPEED_SELECTION[action.payload]
            break
        case actions.FONT_SIZE_SELECTION:
            state["fontSize"] = actions.FONT_SIZE_SELECTION[action.payload]
            break
    }
    return state
}

// 根据属性，合并多个子Reducer，形成最终输出的State
const reducers = combineReducers({
    scene: sceneReducer,
    saves: SavesReducer,
    temp: tempReducer,
    runtime: CurrentInfoReducer,
    settings: SettingsReducer,
    uiState: UiReducer
})

const Store = createStore(reducers)

saveState()
Store.subscribe(saveState)

/**
 * 根据指定结构重新写入localStorage中
 */
function saveState() {
    let temp = {...Store.getState()}
    let singleSave = {
        runtime: currentInfoStoreKey,
        uiState: uiStoreKey
    }
    for (let key in singleSave) {
        LocalStorageUtil.saveData(temp[key], singleSave[key])
        delete temp[key]
    }
    // ignored.forEach(value => delete temp[value])
    LocalStorageUtil.saveData(temp)
}

/**
 *  向store发送action
 * @param {string} type
 * @param {Object|string|number|undefined?} payload
 * @param {Object|string|number|undefined?} extra
 */
const act = (type, payload, extra) => {
    Store.dispatch({type: type, payload: payload, extra: extra})
}

export {Store, actions, act}
export default Store