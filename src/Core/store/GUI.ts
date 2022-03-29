/**
 * @file 记录当前GUI的状态信息，引擎初始化时会重置。
 * @author Mahiru
 */
import {useState} from "react"
import {getStorage} from "../controller/storage/storageController";
import { IGuiState } from "../interface/stateInterface/guiInterface";


/**
 * 当前Menu页面显示的Tag
 */
export enum MenuPanelTag {
    Save,//“保存”选项卡
    Load,//“读取”选项卡
    Option//“设置”选项卡
}



/**
 * 初始GUI状态表
 */
const initState: IGuiState = {
    showStarter:true,
    showTitle: true,
    showMenuPanel: false,
    currentMenuTag: MenuPanelTag.Option,
    titleBg: '',
    titleBgm: ''
}

//GUI各组件是否显示
type componentsVisibility = Pick<IGuiState, Exclude<keyof IGuiState, 'currentMenuTag' | 'titleBg' | 'titleBgm'>>
//标题资源
type GuiAsset = Pick<IGuiState, 'titleBgm' | 'titleBg'>


/**
 * 创建GUI的状态管理
 * @return {IGuiState} GUI状态
 * @return {function} 改变组件可见性
 * @return {function} 改变Menu页面的选项卡
 */
export function GuiStateStore() {
    const [GuiState, setGuiState] = useState(initState);
    /**
     * 设置各组件的可见性
     * @param key 设置的组件
     * @param value 可见性，true or false
     */
    const setVisibility = <K extends keyof componentsVisibility>(key: K, value: boolean) => {
        getStorage();
        GuiState[key] = value;
        setGuiState({...GuiState});
    }

    /**
     * 设置Menu组件显示的标签页
     * @param value 标签页
     */
    const setMenuPanelTag = (value: MenuPanelTag) => {
        getStorage();
        GuiState.currentMenuTag = value;
        setGuiState({...GuiState});
    }

    /**
     * 设置标题页的资源路径
     * @param key 资源名
     * @param value 资源路径
     */
    const setGuiAsset = <K extends keyof GuiAsset>(key: K, value: string) => {
        GuiState[key] = value;
        setGuiState({...GuiState});
    }

    return {
        GuiState,
        setGuiAsset,
        setVisibility,
        setMenuPanelTag
    }
}