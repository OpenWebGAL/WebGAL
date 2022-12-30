"use strict";
exports.__esModule = true;
exports.ADD_NEXT_ARG_LIST = exports.SCRIPT_CONFIG = void 0;
var sceneInterface_1 = require("../interface/sceneInterface.js");
exports.SCRIPT_CONFIG = [
    { scriptString: 'intro', scriptType: sceneInterface_1.commandType.intro },
    { scriptString: 'changeBg', scriptType: sceneInterface_1.commandType.changeBg },
    { scriptString: 'changeFigure', scriptType: sceneInterface_1.commandType.changeFigure },
    { scriptString: 'miniAvatar', scriptType: sceneInterface_1.commandType.miniAvatar },
    { scriptString: 'changeScene', scriptType: sceneInterface_1.commandType.changeScene },
    { scriptString: 'choose', scriptType: sceneInterface_1.commandType.choose },
    { scriptString: 'end', scriptType: sceneInterface_1.commandType.end },
    { scriptString: 'bgm', scriptType: sceneInterface_1.commandType.bgm },
    { scriptString: 'playVideo', scriptType: sceneInterface_1.commandType.video },
    {
        scriptString: 'setComplexAnimation',
        scriptType: sceneInterface_1.commandType.setComplexAnimation
    },
    { scriptString: 'setFilter', scriptType: sceneInterface_1.commandType.setFilter },
    { scriptString: 'pixiInit', scriptType: sceneInterface_1.commandType.pixiInit },
    { scriptString: 'pixiPerform', scriptType: sceneInterface_1.commandType.pixi },
    { scriptString: 'label', scriptType: sceneInterface_1.commandType.label },
    { scriptString: 'jumpLabel', scriptType: sceneInterface_1.commandType.jumpLabel },
    { scriptString: 'setVar', scriptType: sceneInterface_1.commandType.setVar },
    { scriptString: 'callScene', scriptType: sceneInterface_1.commandType.callScene },
    { scriptString: 'showVars', scriptType: sceneInterface_1.commandType.showVars },
    { scriptString: 'unlockCg', scriptType: sceneInterface_1.commandType.unlockCg },
    { scriptString: 'unlockBgm', scriptType: sceneInterface_1.commandType.unlockBgm },
    { scriptString: 'say', scriptType: sceneInterface_1.commandType.say },
    { scriptString: 'filmMode', scriptType: sceneInterface_1.commandType.filmMode },
    { scriptString: 'callScene', scriptType: sceneInterface_1.commandType.callScene },
    { scriptString: 'setTextbox', scriptType: sceneInterface_1.commandType.setTextbox },
    { scriptString: 'setAnimation', scriptType: sceneInterface_1.commandType.setAnimation },
];
exports.ADD_NEXT_ARG_LIST = [
    sceneInterface_1.commandType.bgm,
    sceneInterface_1.commandType.pixi,
    sceneInterface_1.commandType.pixiInit,
    sceneInterface_1.commandType.label,
    sceneInterface_1.commandType["if"],
    sceneInterface_1.commandType.miniAvatar,
    sceneInterface_1.commandType.setVar,
    sceneInterface_1.commandType.unlockBgm,
    sceneInterface_1.commandType.unlockCg,
    sceneInterface_1.commandType.filmMode,
];
