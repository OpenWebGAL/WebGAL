'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var __ = require('lodash');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var ____namespace = /*#__PURE__*/_interopNamespaceDefault(__);

var commandType;
(function (commandType) {
    commandType[commandType["say"] = 0] = "say";
    commandType[commandType["changeBg"] = 1] = "changeBg";
    commandType[commandType["changeFigure"] = 2] = "changeFigure";
    commandType[commandType["bgm"] = 3] = "bgm";
    commandType[commandType["video"] = 4] = "video";
    commandType[commandType["pixi"] = 5] = "pixi";
    commandType[commandType["pixiInit"] = 6] = "pixiInit";
    commandType[commandType["intro"] = 7] = "intro";
    commandType[commandType["miniAvatar"] = 8] = "miniAvatar";
    commandType[commandType["changeScene"] = 9] = "changeScene";
    commandType[commandType["choose"] = 10] = "choose";
    commandType[commandType["end"] = 11] = "end";
    commandType[commandType["setComplexAnimation"] = 12] = "setComplexAnimation";
    commandType[commandType["setFilter"] = 13] = "setFilter";
    commandType[commandType["label"] = 14] = "label";
    commandType[commandType["jumpLabel"] = 15] = "jumpLabel";
    commandType[commandType["chooseLabel"] = 16] = "chooseLabel";
    commandType[commandType["setVar"] = 17] = "setVar";
    commandType[commandType["if"] = 18] = "if";
    commandType[commandType["callScene"] = 19] = "callScene";
    commandType[commandType["showVars"] = 20] = "showVars";
    commandType[commandType["unlockCg"] = 21] = "unlockCg";
    commandType[commandType["unlockBgm"] = 22] = "unlockBgm";
    commandType[commandType["filmMode"] = 23] = "filmMode";
    commandType[commandType["setTextbox"] = 24] = "setTextbox";
    commandType[commandType["setAnimation"] = 25] = "setAnimation";
    commandType[commandType["playEffect"] = 26] = "playEffect";
    commandType[commandType["setTempAnimation"] = 27] = "setTempAnimation";
    commandType[commandType["comment"] = 28] = "comment";
})(commandType || (commandType = {}));

/**
 * 处理命令
 * @param commandRaw
 * @param ADD_NEXT_ARG_LIST
 * @param SCRIPT_CONFIG
 * @return {parsedCommand} 处理后的命令
 */
const commandParser = (commandRaw, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG) => {
    let returnCommand = {
        type: commandType.say,
        additionalArgs: []
    };
    // 开始处理命令内容
    const type = getCommandType(commandRaw, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);
    returnCommand.type = type;
    // 如果是对话，加上额外的参数
    if (type === commandType.say) {
        returnCommand.additionalArgs.push({
            key: "speaker",
            value: commandRaw
        });
    }
    returnCommand = addNextArg(returnCommand, type, ADD_NEXT_ARG_LIST);
    return returnCommand;
};
/**
 * 根据command原始值判断是什么命令
 * @param command command原始值
 * @param ADD_NEXT_ARG_LIST
 * @param SCRIPT_CONFIG
 * @return {commandType} 得到的command类型
 */
function getCommandType(command, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG) {
    // if (command.match(/if/)) {
    //   return commandType.if;
    // }
    const commandMap = new Map();
    SCRIPT_CONFIG.forEach((e) => {
        commandMap.set(e.scriptString, e.scriptType);
    });
    if (commandMap.has(command)) {
        return commandMap.get(command);
    }
    else
        return commandType.say;
}
function addNextArg(commandToParse, thisCommandType, ADD_NEXT_ARG_LIST) {
    if (ADD_NEXT_ARG_LIST.includes(thisCommandType)) {
        commandToParse.additionalArgs.push({
            key: "next",
            value: true
        });
    }
    return commandToParse;
}

/**
 * 内置资源类型的枚举
 */
var fileType;
(function (fileType) {
    fileType[fileType["background"] = 0] = "background";
    fileType[fileType["bgm"] = 1] = "bgm";
    fileType[fileType["figure"] = 2] = "figure";
    fileType[fileType["scene"] = 3] = "scene";
    fileType[fileType["tex"] = 4] = "tex";
    fileType[fileType["vocal"] = 5] = "vocal";
    fileType[fileType["video"] = 6] = "video";
})(fileType || (fileType = {}));

/**
 * 参数解析器
 * @param argsRaw 原始参数字符串
 * @param assetSetter
 * @return {Array<arg>} 解析后的参数列表
 */
function argsParser(argsRaw, assetSetter) {
    const returnArrayList = [];
    // 处理参数
    // 不要去空格
    let newArgsRaw = argsRaw.replace(/ /g, " ");
    // 分割参数列表
    let rawArgsList = newArgsRaw.split(" -");
    // 去除空字符串
    rawArgsList = rawArgsList.filter((e) => {
        return e !== "";
    });
    rawArgsList.forEach((e) => {
        const argName = e.split("=")[0];
        const argValue = e.split("=")[1];
        // 判断是不是语音参数
        if (e.match(/.ogg|.mp3|.wav/)) {
            returnArrayList.push({
                key: "vocal",
                value: assetSetter(e, fileType.vocal)
            });
        }
        else {
            // 判断是不是省略参数
            if (argValue === undefined) {
                returnArrayList.push({
                    key: argName,
                    value: true
                });
            }
            else {
                // 是字符串描述的布尔值
                if (argValue === "true" || argValue === "false") {
                    returnArrayList.push({
                        key: argName,
                        value: argValue === "true"
                    });
                }
                else {
                    // 是数字
                    if (!isNaN(Number(argValue))) {
                        returnArrayList.push({
                            key: argName,
                            value: Number(argValue)
                        });
                    }
                    else {
                        // 是普通参数
                        returnArrayList.push({
                            key: argName,
                            value: argValue
                        });
                    }
                }
            }
        }
    });
    return returnArrayList;
}

/**
 * 解析语句内容的函数，主要作用是把文件名改为绝对地址或相对地址（根据使用情况而定）
 * @param contentRaw 原始语句内容
 * @param type 语句类型
 * @param assetSetter
 * @return {string} 解析后的语句内容
 */
const contentParser = (contentRaw, type, assetSetter) => {
    if (contentRaw === "none" || contentRaw === "") {
        return "";
    }
    switch (type) {
        case commandType.playEffect:
            return assetSetter(contentRaw, fileType.vocal);
        case commandType.changeBg:
            return assetSetter(contentRaw, fileType.background);
        case commandType.changeFigure:
            return assetSetter(contentRaw, fileType.figure);
        case commandType.bgm:
            return assetSetter(contentRaw, fileType.bgm);
        case commandType.callScene:
            return assetSetter(contentRaw, fileType.scene);
        case commandType.changeScene:
            return assetSetter(contentRaw, fileType.scene);
        case commandType.miniAvatar:
            return assetSetter(contentRaw, fileType.figure);
        case commandType.video:
            return assetSetter(contentRaw, fileType.video);
        case commandType.choose:
            return getChooseContent(contentRaw, assetSetter);
        case commandType.unlockBgm:
            return assetSetter(contentRaw, fileType.bgm);
        case commandType.unlockCg:
            return assetSetter(contentRaw, fileType.background);
        default:
            return contentRaw;
    }
};
function getChooseContent(contentRaw, assetSetter) {
    const chooseList = contentRaw.split("|");
    const chooseKeyList = [];
    const chooseValueList = [];
    for (const e of chooseList) {
        chooseKeyList.push(e.split(":")[0]);
        chooseValueList.push(e.split(":")[1]);
    }
    const parsedChooseList = chooseValueList.map((e) => {
        if (e.match(/\./)) {
            return assetSetter(e, fileType.scene);
        }
        else {
            return e;
        }
    });
    let ret = "";
    for (let i = 0; i < chooseKeyList.length; i++) {
        if (i !== 0) {
            ret = ret + "|";
        }
        ret = ret + `${chooseKeyList[i]}:${parsedChooseList[i]}`;
    }
    return ret;
}

/**
 * 根据语句类型、语句内容、参数列表，扫描该语句可能携带的资源
 * @param command 语句类型
 * @param content 语句内容
 * @param args 参数列表
 * @return {Array<IAsset>} 语句携带的参数列表
 */
const assetsScanner = (command, content, args) => {
    const returnAssetsList = [];
    if (command === commandType.say) {
        args.forEach((e) => {
            if (e.key === 'vocal') {
                returnAssetsList.push({
                    name: e.value,
                    url: e.value,
                    lineNumber: 0,
                    type: fileType.vocal,
                });
            }
        });
    }
    if (content === 'none' || content === '') {
        return returnAssetsList;
    }
    // 处理语句携带的资源
    if (command === commandType.changeBg) {
        returnAssetsList.push({
            name: content,
            url: content,
            lineNumber: 0,
            type: fileType.background,
        });
    }
    if (command === commandType.changeFigure) {
        returnAssetsList.push({
            name: content,
            url: content,
            lineNumber: 0,
            type: fileType.figure,
        });
    }
    if (command === commandType.miniAvatar) {
        returnAssetsList.push({
            name: content,
            url: content,
            lineNumber: 0,
            type: fileType.figure,
        });
    }
    if (command === commandType.video) {
        returnAssetsList.push({
            name: content,
            url: content,
            lineNumber: 0,
            type: fileType.video,
        });
    }
    if (command === commandType.bgm) {
        returnAssetsList.push({
            name: content,
            url: content,
            lineNumber: 0,
            type: fileType.bgm,
        });
    }
    return returnAssetsList;
};

/**
 * 扫描子场景
 * @param content 语句内容
 * @return {Array<string>} 子场景列表
 */
const subSceneScanner = (command, content) => {
    const subSceneList = [];
    if (command === commandType.changeScene || command === commandType.callScene) {
        subSceneList.push(content);
    }
    if (command === commandType.choose) {
        const chooseList = content.split('|');
        const chooseValue = chooseList.map((e) => e.split(':')[1]);
        chooseValue.forEach((e) => {
            if (e.match(/\./)) {
                subSceneList.push(e);
            }
        });
    }
    return subSceneList;
};

/**
 * 语句解析器
 * @param sentenceRaw 原始语句
 * @param assetSetter
 * @param ADD_NEXT_ARG_LIST
 * @param SCRIPT_CONFIG
 */
const scriptParser = (sentenceRaw, assetSetter, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG) => {
    let command; // 默认为对话
    let content; // 语句内容
    let subScene; // 语句携带的子场景（可能没有）
    const args = []; // 语句参数列表
    let sentenceAssets; // 语句携带的资源列表
    let parsedCommand; // 解析后的命令
    let commandRaw;
    // 正式开始解析
    // 去分号，前面已做，这里不再需要
    let newSentenceRaw = sentenceRaw.split(";")[0];
    if (newSentenceRaw === "") {
        // 注释提前返回
        return {
            command: commandType.comment,
            commandRaw: "comment",
            content: sentenceRaw.split(";")[1] ?? "",
            args: [],
            sentenceAssets: [],
            subScene: [] // 语句携带的子场景
        };
    }
    // 截取命令
    const getCommandResult = /:/.exec(newSentenceRaw);
    /**
     * 拆分命令和语句，同时处理连续对话。
     */
    // 没有command，说明这是一条连续对话或单条语句
    if (getCommandResult === null) {
        commandRaw = newSentenceRaw;
        parsedCommand = commandParser(commandRaw, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);
        command = parsedCommand.type;
        for (const e of parsedCommand.additionalArgs) {
            // 由于是连续对话，所以我们去除 speaker 参数。
            if (command === commandType.say && e.key === "speaker") {
                continue;
            }
            args.push(e);
        }
    }
    else {
        commandRaw = newSentenceRaw.substring(0, getCommandResult.index);
        // 划分命令区域和content区域
        newSentenceRaw = newSentenceRaw.substring(getCommandResult.index + 1, newSentenceRaw.length);
        parsedCommand = commandParser(commandRaw, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);
        command = parsedCommand.type;
        for (const e of parsedCommand.additionalArgs) {
            args.push(e);
        }
    }
    // 截取参数区域
    const getArgsResult = / -/.exec(newSentenceRaw);
    // 获取到参数
    if (getArgsResult) {
        const argsRaw = newSentenceRaw.substring(getArgsResult.index, sentenceRaw.length);
        newSentenceRaw = newSentenceRaw.substring(0, getArgsResult.index);
        for (const e of argsParser(argsRaw, assetSetter)) {
            args.push(e);
        }
    }
    content = contentParser(newSentenceRaw, command, assetSetter); // 将语句内容里的文件名转为相对或绝对路径
    sentenceAssets = assetsScanner(command, content, args); // 扫描语句携带资源
    subScene = subSceneScanner(command, content); // 扫描语句携带子场景
    return {
        command: command,
        commandRaw: commandRaw,
        content: content,
        args: args,
        sentenceAssets: sentenceAssets,
        subScene: subScene // 语句携带的子场景
    };
};

/**
 * 场景解析器
 * @param rawScene 原始场景
 * @param sceneName 场景名称
 * @param sceneUrl 场景url
 * @param assetsPrefetcher
 * @param assetSetter
 * @param ADD_NEXT_ARG_LIST
 * @param SCRIPT_CONFIG
 * @return {IScene} 解析后的场景
 */
const sceneParser = (rawScene, sceneName, sceneUrl, assetsPrefetcher, assetSetter, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG) => {
    const rawSentenceList = rawScene.split("\n"); // 原始句子列表
    // 去分号留到后面去做了，现在注释要单独处理
    const rawSentenceListWithoutEmpty = rawSentenceList;
    // .map((sentence) => sentence.split(";")[0])
    // .filter((sentence) => sentence.trim() !== "");
    let assetsList = []; // 场景资源列表
    let subSceneList = []; // 子场景列表
    const sentenceList = rawSentenceListWithoutEmpty.map((sentence) => {
        const returnSentence = scriptParser(sentence, assetSetter, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);
        // 在这里解析出语句可能携带的资源和场景，合并到 assetsList 和 subSceneList
        assetsList = [...assetsList, ...returnSentence.sentenceAssets];
        subSceneList = [...subSceneList, ...returnSentence.subScene];
        return returnSentence;
    });
    // 开始资源的预加载
    assetsList = ____namespace.uniqWith(assetsList); // 去重
    assetsPrefetcher(assetsList);
    return {
        sceneName: sceneName,
        sceneUrl: sceneUrl,
        sentenceList: sentenceList,
        assetsList: assetsList,
        subSceneList: subSceneList // 子场景列表
    };
};

class SceneParser {
    assetsPrefetcher;
    assetSetter;
    ADD_NEXT_ARG_LIST;
    SCRIPT_CONFIG;
    constructor(assetsPrefetcher, assetSetter, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG) {
        this.assetsPrefetcher = assetsPrefetcher;
        this.assetSetter = assetSetter;
        this.ADD_NEXT_ARG_LIST = ADD_NEXT_ARG_LIST;
        this.SCRIPT_CONFIG = SCRIPT_CONFIG;
    }
    parse(rawScene, sceneName, sceneUrl) {
        return sceneParser(rawScene, sceneName, sceneUrl, this.assetsPrefetcher, this.assetSetter, this.ADD_NEXT_ARG_LIST, this.SCRIPT_CONFIG);
    }
}

exports.default = SceneParser;
//# sourceMappingURL=index.js.map
