/**
 * 语句类型
 */
enum commandType {
    say, //对话
    changeBg, //更改背景
    changeFigure, //更改立绘
    bgm, //更改背景音乐
    video, //播放视频
    pixi //pixi演出
}

/**
 * 单个参数接口
 * @interface arg
 */
interface arg {
    key: string, //参数键
    value: string | boolean | number //参数值
}

/**
 * 资源类型
 */
enum assetType{
    audio, //音频
    video, //视频
    image, //图片
}

/**
 * 资源接口
 * @interface IAsset
 */
interface IAsset{
    type:assetType, //资源类型
    url:string, //资源url
    lineNumber:number, //触发资源语句的行号
}

/**
 * 单条语句接口
 * @interface ISentence
 */
interface ISentence {
    command: commandType, //语句类型
    content: string, //语句内容
    args: Array<arg> //参数列表
}

/**
 * 场景接口
 * @interface IScene
 */
export interface IScene {
    sceneName: string, //场景名称
    sentenceList: Array<ISentence>, //语句列表
    assetsList: Array<IAsset>, //资源列表
    subSceneList: Array<string> //子场景列表
}