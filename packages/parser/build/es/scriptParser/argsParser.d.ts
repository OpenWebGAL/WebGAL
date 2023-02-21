import { arg } from "../interface/sceneInterface";
import { fileType } from "../interface/assets";
/**
 * 参数解析器
 * @param argsRaw 原始参数字符串
 * @param assetSetter
 * @return {Array<arg>} 解析后的参数列表
 */
export declare function argsParser(argsRaw: string, assetSetter: (fileName: string, assetType: fileType) => string): Array<arg>;
