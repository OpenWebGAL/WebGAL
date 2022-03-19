import {arg, commandType, ISentence} from "../interface/scene";


/**
 * 语句解析器
 * @param sentenceRaw 原始语句
 */
export const scriptParser = (sentenceRaw: string): ISentence => {
    let command = commandType.say;//默认为对话
    let content = '';
    const args: Array<arg> = [];
    return {
        command: command, //语句类型
        content: content, //语句内容
        args: args //参数列表
    }
}