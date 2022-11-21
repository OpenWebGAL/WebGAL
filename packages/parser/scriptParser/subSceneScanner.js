"use strict";
exports.__esModule = true;
exports.subSceneScanner = void 0;
/**
 * 扫描子场景
 * @param content 语句内容
 * @return {Array<string>} 子场景列表
 */
var sceneInterface_1 = require("../interface/sceneInterface");
var subSceneScanner = function (command, content) {
    var subSceneList = [];
    if (command === sceneInterface_1.commandType.changeScene || command === sceneInterface_1.commandType.callScene) {
        subSceneList.push(content);
    }
    if (command === sceneInterface_1.commandType.choose) {
        var chooseList = content.split('|');
        var chooseValue = chooseList.map(function (e) { return e.split(':')[1]; });
        chooseValue.forEach(function (e) {
            if (e.match(/\./)) {
                subSceneList.push(e);
            }
        });
    }
    return subSceneList;
};
exports.subSceneScanner = subSceneScanner;
