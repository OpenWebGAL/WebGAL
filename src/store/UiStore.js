import LocalStorageUtil from "../utils/LocalStorageUtil";

const uiStoreKey = "UI_STORE"

let localData = LocalStorageUtil.loadData(uiStoreKey)

const uiState = {
    settingsScreen: false,
    titleScreen: true,
    textBox: true,
    panicScreen: false,
    saveScreen: false,
    loadScreen: false,
    backlogScreen: false
}

// 获取本地存储数据，并赋值给uiState
if (localData != null) Object.assign(uiState, localData)

const uiActions = {
    SET_SETTINGS_SCREEN: "settingsScreen",
    SET_TITLE_SCREEN: "titleScreen",
    SET_PANIC_SCREEN: "panicScreen",
    SET_SAVE_SCREEN: "saveScreen",
    SET_LOAD_SCREEN: "loadScreen",
    SET_BACKLOG_SCREEN: "backlogScreen",
    SET_TEXT_BOX: "textBox",
}

/**
 *
 * @param state 旧的state
 * @param action 自定义的 action
 * @returns {Object} 返回处理过后新的 state
 */
const UiReducer = (state = uiState, action) => {
    let temp = {...state}

    // eslint-disable-next-line default-case
    switch (action.type) {
        case uiActions.SET_SETTINGS_SCREEN:
        case uiActions.SET_TITLE_SCREEN:
        case uiActions.SET_PANIC_SCREEN:
        case uiActions.SET_SAVE_SCREEN:
        case uiActions.SET_LOAD_SCREEN:
        case uiActions.SET_BACKLOG_SCREEN:
        case uiActions.SET_TEXT_BOX:
            temp[action.type] = action.payload
    }

    return temp
}

export {uiStoreKey, uiActions, uiState, UiReducer}
export default UiReducer
