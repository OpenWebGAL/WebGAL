import { commandType, parsedCommand } from "../interface/sceneInterface";

/**
 * 处理命令
 * @param commandRaw
 * @param ADD_NEXT_ARG_LIST
 * @param SCRIPT_CONFIG
 * @return {parsedCommand} 处理后的命令
 */
export const commandParser = (commandRaw: string, ADD_NEXT_ARG_LIST:any, SCRIPT_CONFIG:any): parsedCommand => {
  let returnCommand: parsedCommand = {
    type: commandType.say, // 默认是say
    additionalArgs: []
  };
  // 开始处理命令内容
  const type: commandType = getCommandType(commandRaw, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);
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
function getCommandType(command: string, ADD_NEXT_ARG_LIST:any, SCRIPT_CONFIG:any): commandType {
  // if (command.match(/if/)) {
  //   return commandType.if;
  // }
  const commandMap = new Map();
  SCRIPT_CONFIG.forEach((e:any) => {
    commandMap.set(e.scriptString, e.scriptType);
  });
  if (commandMap.has(command)) {
    return commandMap.get(command);
  } else return commandType.say;
}

function addNextArg(commandToParse: parsedCommand, thisCommandType: commandType, ADD_NEXT_ARG_LIST:any) {
  if (ADD_NEXT_ARG_LIST.includes(thisCommandType)) {
    commandToParse.additionalArgs.push({
      key: "next",
      value: true
    });
  }
  return commandToParse;
}
