"use strict";
exports.__esModule = true;
exports.scriptParser = void 0;
var sceneInterface_1 = require("../interface/sceneInterface");
var commandParser_1 = require("./commandParser");
var argsParser_1 = require("./argsParser");
var contentParser_1 = require("./contentParser");
var assetsScanner_1 = require("./assetsScanner");
var subSceneScanner_1 = require("./subSceneScanner");
/**
 * 语句解析器
 * @param sentenceRaw 原始语句
 * @param assetSetter
 * @param ADD_NEXT_ARG_LIST
 * @param SCRIPT_CONFIG
 */
var scriptParser = function (sentenceRaw, assetSetter, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG) {
    var command; // 默认为对话
    var content; // 语句内容
    var subScene; // 语句携带的子场景（可能没有）
    var args = []; // 语句参数列表
    var sentenceAssets; // 语句携带的资源列表
    var parsedCommand; // 解析后的命令
    var commandRaw;
    // 正式开始解析
    // 去分号，前面已做，这里不再需要
    var newSentenceRaw = sentenceRaw;
    // 截取命令
    var getCommandResult = /:/.exec(newSentenceRaw);
    /**
     * 拆分命令和语句，同时处理连续对话。
     */
    // 没有command，说明这是一条连续对话或单条语句
    if (getCommandResult === null) {
        commandRaw = newSentenceRaw;
        parsedCommand = (0, commandParser_1.commandParser)(commandRaw, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);
        command = parsedCommand.type;
        for (var _i = 0, _a = parsedCommand.additionalArgs; _i < _a.length; _i++) {
            var e = _a[_i];
            // 由于是连续对话，所以我们去除 speaker 参数。
            if (command === sceneInterface_1.commandType.say && e.key === "speaker") {
                continue;
            }
            args.push(e);
        }
    }
    else {
        commandRaw = newSentenceRaw.substring(0, getCommandResult.index);
        // 划分命令区域和content区域
        newSentenceRaw = newSentenceRaw.substring(getCommandResult.index + 1, newSentenceRaw.length);
        parsedCommand = (0, commandParser_1.commandParser)(commandRaw, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);
        command = parsedCommand.type;
        for (var _b = 0, _c = parsedCommand.additionalArgs; _b < _c.length; _b++) {
            var e = _c[_b];
            args.push(e);
        }
    }
    // 截取参数区域
    var getArgsResult = / -/.exec(newSentenceRaw);
    // 获取到参数
    if (getArgsResult) {
        var argsRaw = newSentenceRaw.substring(getArgsResult.index, sentenceRaw.length);
        newSentenceRaw = newSentenceRaw.substring(0, getArgsResult.index);
        for (var _d = 0, _e = (0, argsParser_1.argsParser)(argsRaw, assetSetter); _d < _e.length; _d++) {
            var e = _e[_d];
            args.push(e);
        }
    }
    content = (0, contentParser_1.contentParser)(newSentenceRaw, command, assetSetter); // 将语句内容里的文件名转为相对或绝对路径
    sentenceAssets = (0, assetsScanner_1.assetsScanner)(command, content, args); // 扫描语句携带资源
    subScene = (0, subSceneScanner_1.subSceneScanner)(command, content); // 扫描语句携带子场景
    return {
        command: command,
        commandRaw: commandRaw,
        content: content,
        args: args,
        sentenceAssets: sentenceAssets,
        subScene: subScene // 语句携带的子场景
    };
};
exports.scriptParser = scriptParser;
