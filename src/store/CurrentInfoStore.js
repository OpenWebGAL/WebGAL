import LocalStorageUtil from "../utils/LocalStorageUtil";

const currentInfoStoreKey = "CURRENT_INFO_STORE"

let localData = LocalStorageUtil.loadData(currentInfoStoreKey)

const currentInfoState = {
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
}

// 获取本地存储数据，并赋值给uiState
if (localData != null) Object.assign(currentInfoState, localData)

const cActions = {
    SET_RUNTIME_SCENE_NAME: 'SceneName',
    SET_RUNTIME_SENTENCE_ID: 'SentenceID',
    SET_RUNTIME_BACKGROUND: 'bg_Name',
    SET_RUNTIME_FIGURE_NAME_MIDDLE: 'fig_Name',
    SET_RUNTIME_FIGURE_NAME_LEFT: 'fig_Name_left',
    SET_RUNTIME_FIGURE_NAME_RIGHT: 'fig_Name_right',
    SET_RUNTIME_SENTENCE_TEXT: 'showText',
    SET_RUNTIME_SPEAKER_NAME: 'showName',
    SET_RUNTIME_COMMAND: 'command',
    SET_RUNTIME_CHOOSE: 'choose',
    SET_RUNTIME_TEXT_ID: 'currentText',
    SET_RUNTIME_VOCAL: 'vocal',
    SET_RUNTIME_BGM: 'bgm',
    SET_RUNTIME: 'runtime',
    CLEAR_RUNTIME: 'clear_runtime',
}

/**
 *
 * @param state 旧的state
 * @param action 自定义的 action
 * @returns {Object} 返回处理过后新的 state
 */
const CurrentInfoReducer = (state = currentInfoState, action) => {
    let temp = {...state}

    // eslint-disable-next-line default-case
    switch (action.type) {
        case cActions.SET_RUNTIME_SCENE_NAME:
        case cActions.SET_RUNTIME_SENTENCE_ID:
        case cActions.SET_RUNTIME_BACKGROUND:
        case cActions.SET_RUNTIME_FIGURE_NAME_MIDDLE:
        case cActions.SET_RUNTIME_FIGURE_NAME_LEFT:
        case cActions.SET_RUNTIME_FIGURE_NAME_RIGHT:
        case cActions.SET_RUNTIME_SENTENCE_TEXT:
        case cActions.SET_RUNTIME_SPEAKER_NAME:
        case cActions.SET_RUNTIME_COMMAND:
        case cActions.SET_RUNTIME_CHOOSE:
        case cActions.SET_RUNTIME_TEXT_ID:
        case cActions.SET_RUNTIME_VOCAL:
        case cActions.SET_RUNTIME_BGM:
            temp[action.type] = action.payload
            break
        case cActions.SET_RUNTIME:
            Object.assign(temp, action.payload)
            break
        case cActions.CLEAR_RUNTIME:
            Object.keys(temp).forEach(key => temp[key] = '')
            break
    }
    return temp
}

export {currentInfoStoreKey, cActions, currentInfoState, CurrentInfoReducer}
export default CurrentInfoReducer
