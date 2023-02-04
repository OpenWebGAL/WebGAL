/**
 * 语句类型
 */
import { sceneEntry } from "./runtimeInterface";
import { fileType } from "./assets";
export declare enum commandType {
    say = 0,
    changeBg = 1,
    changeFigure = 2,
    bgm = 3,
    video = 4,
    pixi = 5,
    pixiInit = 6,
    intro = 7,
    miniAvatar = 8,
    changeScene = 9,
    choose = 10,
    end = 11,
    setComplexAnimation = 12,
    setFilter = 13,
    label = 14,
    jumpLabel = 15,
    chooseLabel = 16,
    setVar = 17,
    if = 18,
    callScene = 19,
    showVars = 20,
    unlockCg = 21,
    unlockBgm = 22,
    filmMode = 23,
    setTextbox = 24,
    setAnimation = 25,
    playEffect = 26,
    setTempAnimation = 27,
    comment = 28
}
/**
 * 单个参数接口
 * @interface arg
 */
export interface arg {
    key: string;
    value: string | boolean | number;
}
/**
 * 资源接口
 * @interface IAsset
 */
export interface IAsset {
    name: string;
    type: fileType;
    url: string;
    lineNumber: number;
}
/**
 * 单条语句接口
 * @interface ISentence
 */
export interface ISentence {
    command: commandType;
    commandRaw: string;
    content: string;
    args: Array<arg>;
    sentenceAssets: Array<IAsset>;
    subScene: Array<string>;
}
/**
 * 场景接口
 * @interface IScene
 */
export interface IScene {
    sceneName: string;
    sceneUrl: string;
    sentenceList: Array<ISentence>;
    assetsList: Array<IAsset>;
    subSceneList: Array<string>;
}
/**
 * 当前的场景数据
 * @interface ISceneData
 */
export interface ISceneData {
    currentSentenceId: number;
    sceneStack: Array<sceneEntry>;
    currentScene: IScene;
}
/**
 * 处理后的命令接口
 * @interface parsedCommand
 */
export interface parsedCommand {
    type: commandType;
    additionalArgs: Array<arg>;
}
