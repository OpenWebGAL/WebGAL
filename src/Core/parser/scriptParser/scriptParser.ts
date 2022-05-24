import {arg, commandType, IAsset, ISentence, parsedCommand} from '../../interface/coreInterface/sceneInterface';
import {commandParser} from './commandParser';
import {argsParser} from './argsParser';
import {contentParser} from './contentParser';
import {assetsScanner} from './assetsScanner';
import {subSceneScanner} from './subSceneScanner';

/**
 * 语句解析器
 * @param sentenceRaw 原始语句
 */
export const scriptParser = (sentenceRaw: string): ISentence => {
  let command: commandType; // 默认为对话
  let content: string; // 语句内容
  let subScene: Array<string>; // 语句携带的子场景（可能没有）
  const args: Array<arg> = []; // 语句参数列表
  let sentenceAssets: Array<IAsset>; // 语句携带的资源列表
  let parsedCommand: parsedCommand; // 解析后的命令
  let commandRaw: string;
  let inheritSaying = '';

  // 正式开始解析

  // 去分号
  let newSentenceRaw = sentenceRaw.split(';')[0];
  // 截取命令
  const getCommandResult = /:/.exec(newSentenceRaw);
  // 没有command，说明这是一条连续对话
  if (getCommandResult === null) {
    const getBlankResult = / /.exec(newSentenceRaw);
    if (getBlankResult) {
      commandRaw = newSentenceRaw.substring(0, getBlankResult.index);
      newSentenceRaw = newSentenceRaw.substring(getBlankResult.index, newSentenceRaw.length);
      parsedCommand = commandParser(commandRaw);
      command = parsedCommand.type;
      for (const e of parsedCommand.additionalArgs) {
        if (command === commandType.say && e.key === 'speaker') {
          inheritSaying = e.value.toString();
        } else
          args.push(e);
      }
    } else {
      commandRaw = newSentenceRaw.substring(0, newSentenceRaw.length);
      newSentenceRaw = newSentenceRaw.substring(0, newSentenceRaw.length);
      parsedCommand = commandParser(commandRaw);
      command = parsedCommand.type;
      if (command !== commandType.say) {
        for (const e of parsedCommand.additionalArgs) {
          args.push(e);
        }
      }
    }
  } else {
    commandRaw = newSentenceRaw.substring(0, getCommandResult.index);
    newSentenceRaw = newSentenceRaw.substring(getCommandResult.index + 1, newSentenceRaw.length);
    parsedCommand = commandParser(commandRaw);
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
    for (const e of argsParser(argsRaw)) {
      args.push(e);
    }
  }
  content = contentParser(newSentenceRaw, command); // 将语句内容里的文件名转为相对或绝对路径
  if (inheritSaying !== '') {
    content = inheritSaying;
  }
  sentenceAssets = assetsScanner(command, content, args); // 扫描语句携带资源
  subScene = subSceneScanner(command, content); // 扫描语句携带子场景
  return {
    command: command, // 语句类型
    commandRaw: commandRaw, // 命令原始内容，方便调试
    content: content, // 语句内容
    args: args, // 参数列表
    sentenceAssets: sentenceAssets, // 语句携带的资源列表
    subScene: subScene, // 语句携带的子场景
  };
};
