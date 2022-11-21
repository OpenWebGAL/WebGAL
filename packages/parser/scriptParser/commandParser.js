"use strict";
exports.__esModule = true;
exports.commandParser = void 0;
var sceneInterface_1 = require("../interface/sceneInterface");
/**
 * 处理命令
 * @param commandRaw
 * @param ADD_NEXT_ARG_LIST
 * @param SCRIPT_CONFIG
 * @return {parsedCommand} 处理后的命令
 */
var commandParser = function (commandRaw, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG) {
    var returnCommand = {
        type: sceneInterface_1.commandType.say,
        additionalArgs: []
    };
    // 开始处理命令内容
    var type = getCommandType(commandRaw, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);
    returnCommand.type = type;
    // 如果是对话，加上额外的参数
    if (type === sceneInterface_1.commandType.say) {
        returnCommand.additionalArgs.push({
            key: "speaker",
            value: commandRaw
        });
    }
    returnCommand = addNextArg(returnCommand, type, ADD_NEXT_ARG_LIST);
    return returnCommand;
};
exports.commandParser = commandParser;
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
    var commandMap = new Map();
    SCRIPT_CONFIG.forEach(function (e) {
        commandMap.set(e.scriptString, e.scriptType);
    });
    if (commandMap.has(command)) {
        return commandMap.get(command);
    }
    else
        return sceneInterface_1.commandType.say;
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
