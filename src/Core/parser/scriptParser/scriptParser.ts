import {arg, commandType, IAsset, ISentence, parsedCommand} from "../../interface/scene";
import {logger} from "../../util/logger";
import {commandParser} from "./commandParser";
import {argsParser} from "./argsParser";
import {contentParser} from "./contentParser";
import {assetsScanner} from "./assetsScanner";


/**
 * 语句解析器
 * @param sentenceRaw 原始语句
 */
export const scriptParser = (sentenceRaw: string): ISentence => {
    let command: commandType;//默认为对话
    let content: string; //语句内容
    let subScene: Array<string>; //语句携带的子场景（可能没有）
    const args: Array<arg> = [];//语句参数列表
    let sentenceAssets: Array<IAsset>;//语句携带的资源列表
    let parsedCommand: parsedCommand;//解析后的命令

    //正式开始解析

    //去分号
    sentenceRaw = sentenceRaw.split(';')[0];
    logger.info('当前句子：', sentenceRaw);
    //截取命令
    const getCommandResult = /:/.exec(sentenceRaw);
    //没有command，说明这是一条连续对话
    if (!getCommandResult) {
        command = commandType.say;
    } else {
        const commandRaw: string = sentenceRaw.substring(0, getCommandResult.index);
        logger.info('命令信息', commandRaw);
        sentenceRaw = sentenceRaw.substring(getCommandResult.index + 1, sentenceRaw.length);
        parsedCommand = commandParser(commandRaw);
        command = parsedCommand.type;
        for (const e of parsedCommand.additionalArgs) {
            args.push(e);
        }
    }
    //截取参数区域
    const getArgsResult = / -/.exec(sentenceRaw);
    //获取到参数
    if (getArgsResult) {
        const argsRaw = sentenceRaw.substring(getArgsResult.index, sentenceRaw.length);
        logger.info('参数信息', argsRaw);
        sentenceRaw = sentenceRaw.substring(0, getArgsResult.index);
        for (const e of argsParser(argsRaw)) {
            args.push(e);
        }
    }
    content = contentParser(sentenceRaw);
    logger.info('语句内容', content);
    sentenceAssets = assetsScanner(command, content, args);//扫描语句携带资源
    subScene = subSceneScanner(content);//扫描语句携带子场景
    const parsedSentence: ISentence = {
        command: command, //语句类型
        content: content, //语句内容
        args: args, //参数列表
        sentenceAssets: sentenceAssets, //语句携带的资源列表
        subScene: subScene //语句携带的子场景
    };
    logger.info('处理后句子：', parsedSentence);
    return parsedSentence;
}