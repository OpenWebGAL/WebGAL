"use strict";
exports.__esModule = true;
exports.argsParser = void 0;
var assets_1 = require("../interface/assets");
/**
 * 参数解析器
 * @param argsRaw 原始参数字符串
 * @param assetSetter
 * @return {Array<arg>} 解析后的参数列表
 */
function argsParser(argsRaw, assetSetter) {
    var returnArrayList = [];
    // 处理参数
    // 不要去空格
    var newArgsRaw = argsRaw.replace(/ /g, " ");
    // 分割参数列表
    var rawArgsList = newArgsRaw.split(" -");
    // 去除空字符串
    rawArgsList = rawArgsList.filter(function (e) {
        return e !== "";
    });
    rawArgsList.forEach(function (e) {
        var argName = e.split("=")[0];
        var argValue = e.split("=")[1];
        // 判断是不是语音参数
        if (e.match(/.ogg|.mp3|.wav/)) {
            returnArrayList.push({
                key: "vocal",
                value: assetSetter(e, assets_1.fileType.vocal)
            });
        }
        else {
            // 判断是不是省略参数
            if (argValue === undefined) {
                returnArrayList.push({
                    key: argName,
                    value: true
                });
            }
            else {
                // 是字符串描述的布尔值
                if (argValue === "true" || argValue === "false") {
                    returnArrayList.push({
                        key: argName,
                        value: argValue === "true"
                    });
                }
                else {
                    // 是数字
                    if (!isNaN(Number(argValue))) {
                        returnArrayList.push({
                            key: argName,
                            value: Number(argValue)
                        });
                    }
                    else {
                        // 是普通参数
                        returnArrayList.push({
                            key: argName,
                            value: argValue
                        });
                    }
                }
            }
        }
    });
    return returnArrayList;
}
exports.argsParser = argsParser;
;
