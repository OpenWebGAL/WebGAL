import { argsParser } from '../scriptParser/argsParser';

interface IOptionItem {
  key: string;
  value: string | number | boolean;
}
interface IConfigItem {
  command: string;
  args: string[];
  options: IOptionItem[];
}

export type WebgalConfig = IConfigItem[];

function configLineParser(inputLine: string): IConfigItem {
  const options: Array<IOptionItem> = [];
  let command: string;

  let newSentenceRaw = inputLine.split(';')[0];
  if (newSentenceRaw === '') {
    // 注释提前返回
    return {
      command: '',
      args: [],
      options: [],
    };
  }
  // 截取命令
  const getCommandResult = /\s*:\s*/.exec(newSentenceRaw);

  // 没有command
  if (getCommandResult === null) {
    command = '';
  } else {
    command = newSentenceRaw.substring(0, getCommandResult.index);
    // 划分命令区域和content区域
    newSentenceRaw = newSentenceRaw.substring(
      getCommandResult.index + 1,
      newSentenceRaw.length,
    );
  }
  // 截取 Options 区域
  const getOptionsResult = / -/.exec(newSentenceRaw);
  // 获取到参数
  if (getOptionsResult) {
    const optionsRaw = newSentenceRaw.substring(
      getOptionsResult.index,
      newSentenceRaw.length,
    );
    newSentenceRaw = newSentenceRaw.substring(0, getOptionsResult.index);
    for (const e of argsParser(optionsRaw, (name, _) => {
      return name;
    })) {
      options.push(e);
    }
  }
  return {
    command,
    args: newSentenceRaw
      .split('|')
      .map((e) => e.trim())
      .filter((e) => e !== ''),
    options,
  };
}

export function configParser(configText: string): WebgalConfig {
  const configLines = configText.replaceAll(`\r`, '').split('\n');
  return configLines
    .map((e) => configLineParser(e))
    .filter((e) => e.command !== '');
}
