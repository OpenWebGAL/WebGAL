import { commandType } from "../interface/sceneInterface";
/**
 * 解析语句内容的函数，主要作用是把文件名改为绝对地址或相对地址（根据使用情况而定）
 * @param contentRaw 原始语句内容
 * @param type 语句类型
 * @param assetSetter
 * @return {string} 解析后的语句内容
 */
export declare const contentParser: (contentRaw: string, type: commandType, assetSetter: any) => any;
