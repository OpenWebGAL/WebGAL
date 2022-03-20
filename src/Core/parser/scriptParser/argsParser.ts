import {arg} from "../../interface/scene";

const argsParser = (argsRaw: string): Array<arg> => {
    const returnArrayList: Array<arg> = [];
    //处理参数
    // 分割参数列表
    let rawArgsList: Array<string> = argsRaw.split('-');
    //去空格
    rawArgsList = rawArgsList.map(e => e.replace(/ /g, ''));
    
    return returnArrayList;
}