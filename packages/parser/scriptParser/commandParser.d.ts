import { parsedCommand } from "../interface/sceneInterface";
/**
 * 处理命令
 * @param commandRaw
 * @param ADD_NEXT_ARG_LIST
 * @param SCRIPT_CONFIG
 * @return {parsedCommand} 处理后的命令
 */
export declare const commandParser: (commandRaw: string, ADD_NEXT_ARG_LIST: any, SCRIPT_CONFIG: any) => parsedCommand;
