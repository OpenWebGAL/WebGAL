import {sceneEntry} from "../interface/runtime";
import {IScene} from "../interface/scene";

/**
 * 当前的场景数据
 * @interface ISceneData
 */
interface ISceneData {
    currentSentenceId: number,//当前语句ID
    sceneStack: Array<sceneEntry>, //场景栈
    currentScene: IScene, //当前场景数据
}

//场景数据
export const runtime_currentSceneData: ISceneData = {
    currentSentenceId: 0,//当前语句ID
    sceneStack: [],
    //初始场景，没有数据
    currentScene: {
        sceneName: '', //场景名称
        sceneUrl: '', //场景url
        sentenceList: [], //语句列表
        assetsList: [], //资源列表
        subSceneList: [] //子场景列表
    },
}