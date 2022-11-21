"use strict";
exports.__esModule = true;
exports.assetsScanner = void 0;
var sceneInterface_1 = require("../interface/sceneInterface");
var assets_1 = require("../interface/assets");
/**
 * 根据语句类型、语句内容、参数列表，扫描该语句可能携带的资源
 * @param command 语句类型
 * @param content 语句内容
 * @param args 参数列表
 * @return {Array<IAsset>} 语句携带的参数列表
 */
var assetsScanner = function (command, content, args) {
    var hasVocalArg = false;
    var returnAssetsList = [];
    if (command === sceneInterface_1.commandType.say) {
        args.forEach(function (e) {
            if (e.key === 'vocal') {
                hasVocalArg = true;
                returnAssetsList.push({
                    name: e.value,
                    url: e.value,
                    lineNumber: 0,
                    type: assets_1.fileType.vocal
                });
            }
        });
    }
    if (content === 'none' || content === '') {
        return returnAssetsList;
    }
    // 处理语句携带的资源
    if (command === sceneInterface_1.commandType.changeBg) {
        returnAssetsList.push({
            name: content,
            url: content,
            lineNumber: 0,
            type: assets_1.fileType.background
        });
    }
    if (command === sceneInterface_1.commandType.changeFigure) {
        returnAssetsList.push({
            name: content,
            url: content,
            lineNumber: 0,
            type: assets_1.fileType.figure
        });
    }
    if (command === sceneInterface_1.commandType.miniAvatar) {
        returnAssetsList.push({
            name: content,
            url: content,
            lineNumber: 0,
            type: assets_1.fileType.figure
        });
    }
    if (command === sceneInterface_1.commandType.video) {
        returnAssetsList.push({
            name: content,
            url: content,
            lineNumber: 0,
            type: assets_1.fileType.video
        });
    }
    if (command === sceneInterface_1.commandType.bgm) {
        returnAssetsList.push({
            name: content,
            url: content,
            lineNumber: 0,
            type: assets_1.fileType.bgm
        });
    }
    return returnAssetsList;
};
exports.assetsScanner = assetsScanner;
