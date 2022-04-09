import {ISceneData} from "../interface/coreInterface/sceneInterface";



export const initSceneData = {
    currentSentenceId: 0,// 当前语句ID
    sceneStack: [],
    // 初始场景，没有数据
    currentScene: {
        sceneName: '', // 场景名称
        sceneUrl: '', // 场景url
        sentenceList: [], // 语句列表
        assetsList: [], // 资源列表
        subSceneList: [] // 子场景列表
    },
}
// 场景数据
export const runtime_currentSceneData: ISceneData = initSceneData;