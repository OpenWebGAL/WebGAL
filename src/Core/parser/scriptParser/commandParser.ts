import {commandType, parsedCommand} from "../../interface/scene";

/**
 * 处理命令
 * @param commandRaw
 * @return {parsedCommand} 处理后的命令
 */
const commandParser = (commandRaw: string): parsedCommand => {
    const returnCommand: parsedCommand = {
        type: commandType.say, //默认是say
        additionalArgs: []
    }
    //开始处理命令内容
    const type: commandType = getCommandType(commandRaw);

    //如果是对话，加上额外的参数
    if (type === commandType.say) {
        returnCommand.additionalArgs.push({
            key: 'speaker',
            value: commandRaw,
        })
    }
    return returnCommand;
}

/**
 * 根据command原始值判断是什么命令
 * @param command command原始值
 * @return {commandType} 得到的command类型
 */
function getCommandType(command: string): commandType {


    //默认是对话
    return commandType.say;
}