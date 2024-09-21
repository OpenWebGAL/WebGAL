import { ConfigMap } from '../config/scriptConfig';
import { commandType, parsedCommand } from '../interface/sceneInterface';

/**
 * 处理命令
 * @param commandRaw
 * @param ADD_NEXT_ARG_LIST
 * @param SCRIPT_CONFIG_MAP
 * @return {parsedCommand} 处理后的命令
 */
export const commandParser = (
  commandRaw: string,
  ADD_NEXT_ARG_LIST: commandType[],
  SCRIPT_CONFIG_MAP: ConfigMap,
): parsedCommand => {
  let returnCommand: parsedCommand = {
    type: commandType.say, // 默认是say
    additionalArgs: [],
  };
  // 开始处理命令内容
  const type: commandType = getCommandType(
    commandRaw,
    ADD_NEXT_ARG_LIST,
    SCRIPT_CONFIG_MAP,
  );
  returnCommand.type = type;
  // 如果是对话，加上额外的参数
  if (type === commandType.say && commandRaw !== 'say') {
    returnCommand.additionalArgs.push({
      key: 'speaker',
      value: commandRaw,
    });
  }
  returnCommand = addNextArg(returnCommand, type, ADD_NEXT_ARG_LIST);
  return returnCommand;
};

/**
 * 根据command原始值判断是什么命令
 * @param command command原始值
 * @param ADD_NEXT_ARG_LIST
 * @param SCRIPT_CONFIG_MAP
 * @return {commandType} 得到的command类型
 */
function getCommandType(
  command: string,
  ADD_NEXT_ARG_LIST: commandType[],
  SCRIPT_CONFIG_MAP: ConfigMap,
): commandType {
  return SCRIPT_CONFIG_MAP.get(command)?.scriptType ?? commandType.say;
}

function addNextArg(
  commandToParse: parsedCommand,
  thisCommandType: commandType,
  ADD_NEXT_ARG_LIST: commandType[],
) {
  if (ADD_NEXT_ARG_LIST.includes(thisCommandType)) {
    commandToParse.additionalArgs.push({
      key: 'next',
      value: true,
    });
  }
  return commandToParse;
}
