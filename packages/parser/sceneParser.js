"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.sceneParser = void 0;
var scriptParser_1 = require("./scriptParser/scriptParser");
var __ = require("lodash");
/**
 * 场景解析器
 * @param rawScene 原始场景
 * @param sceneName 场景名称
 * @param sceneUrl 场景url
 * @param assetsPrefetcher
 * @param assetSetter
 * @param ADD_NEXT_ARG_LIST
 * @param SCRIPT_CONFIG
 * @return {IScene} 解析后的场景
 */
var sceneParser = function (rawScene, sceneName, sceneUrl, assetsPrefetcher, assetSetter, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG) {
    var rawSentenceList = rawScene.split("\n"); // 原始句子列表
    // 去除冒号后的内容
    // 去除分号后的内容
    var rawSentenceListWithoutEmpty = rawSentenceList
        .map(function (sentence) { return sentence.split(";")[0]; })
        .filter(function (sentence) { return sentence.trim() !== ""; });
    var assetsList = []; // 场景资源列表
    var subSceneList = []; // 子场景列表
    var sentenceList = rawSentenceListWithoutEmpty.map(function (sentence) {
        var returnSentence = (0, scriptParser_1.scriptParser)(sentence, assetSetter, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);
        // 在这里解析出语句可能携带的资源和场景，合并到 assetsList 和 subSceneList
        assetsList = __spreadArray(__spreadArray([], assetsList, true), returnSentence.sentenceAssets, true);
        subSceneList = __spreadArray(__spreadArray([], subSceneList, true), returnSentence.subScene, true);
        return returnSentence;
    });
    // 开始资源的预加载
    assetsList = __.uniqWith(assetsList); // 去重
    assetsPrefetcher(assetsList);
    return {
        sceneName: sceneName,
        sceneUrl: sceneUrl,
        sentenceList: sentenceList,
        assetsList: assetsList,
        subSceneList: subSceneList // 子场景列表
    };
};
exports.sceneParser = sceneParser;
