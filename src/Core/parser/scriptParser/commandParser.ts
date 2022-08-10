import { commandType, parsedCommand } from '@/interface/coreInterface/sceneInterface';
import { addNextArgList, scriptConfig } from '@/Core/config/scriptConfig';

/**
 * 处理命令
 * @param commandRaw
 * @return {parsedCommand} 处理后的命令
 */
export const commandParser = (commandRaw: string): parsedCommand => {
  let returnCommand: parsedCommand = {
    type: commandType.say, // 默认是say
    additionalArgs: [],
  };
  // 开始处理命令内容
  const type: commandType = getCommandType(commandRaw);
  returnCommand.type = type;
  // 如果是对话，加上额外的参数
  if (type === commandType.say) {
    returnCommand.additionalArgs.push({
      key: 'speaker',
      value: commandRaw,
    });
  }
  returnCommand = addNextArg(returnCommand, type);
  return returnCommand;
};

/**
 * 根据command原始值判断是什么命令
 * @param command command原始值
 * @return {commandType} 得到的command类型
 */
function getCommandType(command: string): commandType {
  // if (command.match(/if/)) {
  //   return commandType.if;
  // }
  const commandMap = new Map();
  scriptConfig.forEach((e) => {
    commandMap.set(e.scriptString, e.scriptType);
  });
  if (commandMap.has(command)) {
    return commandMap.get(command);
  } else return commandType.say;
}

function addNextArg(commandToParse: parsedCommand, thisCommandType: commandType) {
  if (addNextArgList.includes(thisCommandType)) {
    commandToParse.additionalArgs.push({
      key: 'next',
      value: true,
    });
  }
  return commandToParse;
}
