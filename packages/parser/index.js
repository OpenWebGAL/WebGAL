"use strict";
exports.__esModule = true;
exports.SceneParser = void 0;
var sceneParser_1 = require("./sceneParser");
var SceneParser = /** @class */ (function () {
    function SceneParser(assetsPrefetcher, assetSetter, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG) {
        this.assetsPrefetcher = assetsPrefetcher;
        this.assetSetter = assetSetter;
        this.ADD_NEXT_ARG_LIST = ADD_NEXT_ARG_LIST;
        this.SCRIPT_CONFIG = SCRIPT_CONFIG;
    }
    SceneParser.prototype.parse = function (rawScene, sceneName, sceneUrl) {
        return (0, sceneParser_1.sceneParser)(rawScene, sceneName, sceneUrl, this.assetsPrefetcher, this.assetSetter, this.ADD_NEXT_ARG_LIST, this.SCRIPT_CONFIG);
    };
    return SceneParser;
}());
exports.SceneParser = SceneParser;
