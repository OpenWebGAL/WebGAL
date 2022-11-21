"use strict";
exports.__esModule = true;
exports.contentParser = void 0;
var sceneInterface_1 = require("../interface/sceneInterface");
var assets_1 = require("../interface/assets");
/**
 * 解析语句内容的函数，主要作用是把文件名改为绝对地址或相对地址（根据使用情况而定）
 * @param contentRaw 原始语句内容
 * @param type 语句类型
 * @param assetSetter
 * @return {string} 解析后的语句内容
 */
var contentParser = function (contentRaw, type, assetSetter) {
    if (contentRaw === "none" || contentRaw === "") {
        return "";
    }
    switch (type) {
        case sceneInterface_1.commandType.changeBg:
            return assetSetter(contentRaw, assets_1.fileType.background);
        case sceneInterface_1.commandType.changeFigure:
            return assetSetter(contentRaw, assets_1.fileType.figure);
        case sceneInterface_1.commandType.bgm:
            return assetSetter(contentRaw, assets_1.fileType.bgm);
        case sceneInterface_1.commandType.callScene:
            return assetSetter(contentRaw, assets_1.fileType.scene);
        case sceneInterface_1.commandType.changeScene:
            return assetSetter(contentRaw, assets_1.fileType.scene);
        case sceneInterface_1.commandType.miniAvatar:
            return assetSetter(contentRaw, assets_1.fileType.figure);
        case sceneInterface_1.commandType.video:
            return assetSetter(contentRaw, assets_1.fileType.video);
        case sceneInterface_1.commandType.choose:
            return getChooseContent(contentRaw, assetSetter);
        case sceneInterface_1.commandType.unlockBgm:
            return assetSetter(contentRaw, assets_1.fileType.bgm);
        case sceneInterface_1.commandType.unlockCg:
            return assetSetter(contentRaw, assets_1.fileType.background);
        default:
            return contentRaw;
    }
};
exports.contentParser = contentParser;
function getChooseContent(contentRaw, assetSetter) {
    var chooseList = contentRaw.split("|");
    var chooseKeyList = [];
    var chooseValueList = [];
    for (var _i = 0, chooseList_1 = chooseList; _i < chooseList_1.length; _i++) {
        var e = chooseList_1[_i];
        chooseKeyList.push(e.split(":")[0]);
        chooseValueList.push(e.split(":")[1]);
    }
    var parsedChooseList = chooseValueList.map(function (e) {
        if (e.match(/\./)) {
            return assetSetter(e, assets_1.fileType.scene);
        }
        else {
            return e;
        }
    });
    var ret = "";
    for (var i = 0; i < chooseKeyList.length; i++) {
        if (i !== 0) {
            ret = ret + "|";
        }
        ret = ret + "".concat(chooseKeyList[i], ":").concat(parsedChooseList[i]);
    }
    return ret;
}
