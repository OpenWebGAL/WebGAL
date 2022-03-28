import {commandType, parsedCommand} from "../../interface/scene";

/**
 * 处理命令
 * @param commandRaw
 * @return {parsedCommand} 处理后的命令
 */
export const commandParser = (commandRaw: string): parsedCommand => {
    const returnCommand: parsedCommand = {
        type: commandType.say, //默认是say
        additionalArgs: []
    }
    //开始处理命令内容
    const type: commandType = getCommandType(commandRaw);
    returnCommand.type = type;
    //如果是对话，加上额外的参数
    if (type === commandType.say) {
        returnCommand.additionalArgs.push({
            key: 'speaker',
            value: commandRaw,
        })
    }
    if (type === commandType.bgm) {
        returnCommand.additionalArgs.push({
            key: 'next',
            value: true,
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
    if (command.match(/if/)) {
        return commandType.if;
    }
    switch (command) {
        case 'intro':
            return commandType.intro;
        case 'changeBg':
            return commandType.changeBg;
        case 'changeFigure':
            return commandType.changeFigure;
        case 'miniAvatar':
            return commandType.miniAvatar;
        case 'changeScene':
            return commandType.changeScene;
        case 'choose':
            return commandType.choose;
        case 'end':
            return commandType.end;
        case 'bgm':
            return commandType.bgm;
        case 'playVideo':
            return commandType.video;
        case 'setBgAni':
            return commandType.perform_bgAni;
        case 'setFigAni':
            return commandType.perform_FigAni;
        case 'setBgTransform':
            return commandType.setBgTransform;
        case 'setBgFilter':
            return commandType.setBgFilter;
        case 'setFigTransform':
            return commandType.setFigTransform;
        case 'setFigFilter':
            return commandType.setFigFilter;
        case 'pixiInit':
            return commandType.pixiInit;
        case 'pixiPerform':
            return commandType.pixi;
        case 'label':
            return commandType.label;
        case 'jumpLabel':
            return commandType.jumpLabel;
        case 'chooseLabel':
            return commandType.chooseLabel;
        case 'setVar':
            return commandType.setVar;
        default:
            //默认是对话
            return commandType.say;
    }

}