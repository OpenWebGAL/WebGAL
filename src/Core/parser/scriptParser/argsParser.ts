import {arg} from "../../interface/scene";
import {logger} from "../../util/logger";
import {assetSetter, fileType} from "../../util/assetSetter";

export const argsParser = (argsRaw: string): Array<arg> => {
    const returnArrayList: Array<arg> = [];
    //处理参数
    //去空格
    argsRaw = argsRaw.replace(/ /g, '');
    // 分割参数列表
    let rawArgsList: Array<string> = argsRaw.split('-');
    //去除空字符串
    rawArgsList = rawArgsList.filter(e => {
        return e !== ''
    });
    rawArgsList.forEach(e => {
        const argName = e.split('=')[0];
        const argValue = e.split('=')[1];
        //判断是不是语音参数
        if (e.match(/.ogg|.mp3|.wav/)) {
            returnArrayList.push({
                key: 'vocal',
                value: assetSetter(e, fileType.vocal)
            })
        } else {
            //判断是不是省略参数
            if (argValue === undefined) {
                returnArrayList.push({
                    key: argName,
                    value: true
                })
            } else {
                //是字符串描述的布尔值
                if (argValue === 'true' || argValue === 'false') {
                    returnArrayList.push({
                        key: argName,
                        value: argValue === 'true'
                    })
                } else {
                    //是数字
                    if (!isNaN(Number(argValue))) {
                        returnArrayList.push({
                            key: argName,
                            value: Number(argValue)
                        })
                    } else {//是普通参数
                        returnArrayList.push({
                            key: argName,
                            value: argValue
                        })
                    }
                }
            }
        }
    })
    return returnArrayList;
}