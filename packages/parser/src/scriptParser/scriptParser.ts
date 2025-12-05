import {
  arg,
  commandType,
  IAsset,
  ISentence,
  parsedCommand,
} from '../interface/sceneInterface';
import { commandParser } from './commandParser';
import { argsParser } from './argsParser';
import { contentParser } from './contentParser';
import { assetsScanner } from './assetsScanner';
import { subSceneScanner } from './subSceneScanner';
import { ConfigMap } from '../config/scriptConfig';

/**
 * 语句解析器
 * @param sentenceRaw 原始语句
 * @param assetSetter
 * @param ADD_NEXT_ARG_LIST
 * @param SCRIPT_CONFIG_MAP
 */
export const scriptParser = (
  sentenceRaw: string,
  assetSetter: any,
  ADD_NEXT_ARG_LIST: commandType[],
  SCRIPT_CONFIG_MAP: ConfigMap,
): ISentence => {
  let command: commandType; // 默认为对话
  let content: string; // 语句内容
  let subScene: Array<string>; // 语句携带的子场景（可能没有）
  const args: Array<arg> = []; // 语句参数列表
  let sentenceAssets: Array<IAsset>; // 语句携带的资源列表
  let parsedCommand: parsedCommand; // 解析后的命令
  let commandRaw: string;

  // 正式开始解析

  // 去分号
  const commentSplit = sentenceRaw.split(/(?<!\\);/);
  let newSentenceRaw = commentSplit[0];
  newSentenceRaw = newSentenceRaw.replaceAll('\\;',';');
  const sentenceComment = commentSplit[1] ?? '';
  if (newSentenceRaw.trim() === '') {
    // 注释提前返回
    return {
      command: commandType.comment, // 语句类型
      commandRaw: 'comment', // 命令原始内容，方便调试
      content: sentenceComment.trim(), // 语句内容
      args: [{ key: 'next', value: true }], // 参数列表
      sentenceAssets: [], // 语句携带的资源列表
      subScene: [], // 语句携带的子场景
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
    parsedCommand = commandParser(
      commandRaw,
      ADD_NEXT_ARG_LIST,
      SCRIPT_CONFIG_MAP,
    );
    command = parsedCommand.type;
    for (const e of parsedCommand.additionalArgs) {
      // 由于是连续对话，所以我们去除 speaker 参数。
      if (command === commandType.say && e.key === 'speaker') {
        continue;
      }
      args.push(e);
    }
  } else {
    commandRaw = newSentenceRaw.substring(0, getCommandResult.index);
    // 划分命令区域和content区域
    newSentenceRaw = newSentenceRaw.substring(
      getCommandResult.index + 1,
      newSentenceRaw.length,
    );
    parsedCommand = commandParser(
      commandRaw,
      ADD_NEXT_ARG_LIST,
      SCRIPT_CONFIG_MAP,
    );
    command = parsedCommand.type;
    for (const e of parsedCommand.additionalArgs) {
      args.push(e);
    }
  }
  // 截取参数区域
  const getArgsResult = / -/.exec(newSentenceRaw);
  // 获取到参数
  if (getArgsResult) {
    const argsRaw = newSentenceRaw.substring(
      getArgsResult.index,
      sentenceRaw.length,
    );
    newSentenceRaw = newSentenceRaw.substring(0, getArgsResult.index);
    for (const e of argsParser(argsRaw, assetSetter)) {
      args.push(e);
    }
  }
  content = contentParser(newSentenceRaw.trim(), command, assetSetter); // 将语句内容里的文件名转为相对或绝对路径
  sentenceAssets = assetsScanner(command, content, args); // 扫描语句携带资源
  subScene = subSceneScanner(command, content); // 扫描语句携带子场景
  return {
    command: command, // 语句类型
    commandRaw: commandRaw.trim(), // 命令原始内容，方便调试
    content: content, // 语句内容
    args: args, // 参数列表
    sentenceAssets: sentenceAssets, // 语句携带的资源列表
    subScene: subScene, // 语句携带的子场景
  };
};
