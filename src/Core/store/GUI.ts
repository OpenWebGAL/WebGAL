/**
 * 记录当前GUI的状态信息，引擎初始化时会重置。
 */

import {useState} from "react"

//GUI状态类型
interface GuiState {
    showTitle: boolean,
    showMenuPanel: boolean,
    currentMenuTag: MenuPanelTag,
}

//当前Menu页面显示的Tag
enum MenuPanelTag {
    Save,
    Load,
    Option
}

//初始化GUI状态表
const initState: GuiState = {
    showTitle: true,
    showMenuPanel: false,
    currentMenuTag: MenuPanelTag.Option
}

//GUI各组件是否显示
type componentsVisibility = Pick<GuiState, Exclude<keyof GuiState, 'currentMenuTag'>>

export function GuiStateStore() {
    const [state, setState] = useState(initState);
    const setVisibility = <K extends keyof componentsVisibility>(key: K, value: boolean) => {
        state[key] = value;
        setState({...state});
    }
    const setMenuPanelTag = (value: MenuPanelTag) => {
        state.currentMenuTag = value;
        setState({...state});
    }

    return {
        state,
        setVisibility,
        setMenuPanelTag
    }
}