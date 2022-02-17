import say from "./scripts/say";
import {changeBG, changeBG_next} from "./scripts/changeBG";
import {
    changeP,
    changeP_left,
    changeP_left_next,
    changeP_next,
    changeP_right,
    changeP_right_next
} from "./scripts/changeP";
import {pixiInit, pixiPerform} from "./scripts/pixi";
import changeScene from "./scripts/changeScene";
import choose from "./scripts/choose";
import bgm from "./scripts/bgm";
import choose_label from "./scripts/choose_label";
import jump_label from "./scripts/jump_label";
import label from "./scripts/label";
import intro from "./scripts/intro";
import miniAvatar from "./scripts/miniAvatar";
import showVar from "./scripts/showVar";
import {setBgFilter, setBgTransform} from "./scripts/setBgConfig";
import {setBgAni, setFigAni} from "./scripts/setAnimation";
import playVideo from "./scripts/playVideo";
import setVar from "./scripts/setVar";

//这里是每一种script对应的动作
const scriptToFunction = {
    'say': say,
    'changeBG': changeBG,
    'changeBG_next': changeBG_next,
    'changeP': changeP,
    'changeP_left': changeP_left,
    'changeP_right': changeP_right,
    'changeP_next': changeP_next,
    'changeP_left_next': changeP_left_next,
    'changeP_right_next': changeP_right_next,
    'pixiInit': pixiInit,
    'pixiPerform': pixiPerform,
    'changeScene': changeScene,
    'choose': choose,
    'bgm': bgm,
    'choose_label': choose_label,
    'jump_label': jump_label,
    'label': label,
    'intro': intro,
    'miniAvatar': miniAvatar,
    'showVar': showVar,
    'setBgTransform': setBgTransform,
    'setBgFilter': setBgFilter,
    'setVar': setVar,
    'setBgAni': setBgAni,
    'setFigAni': setFigAni,
    'playVideo': playVideo,
}

const runScript = (scriptType, S_content) => {
    let runFunc = say;
    if (scriptToFunction.hasOwnProperty(scriptType))
        runFunc = scriptToFunction[scriptType];
    return runFunc(S_content);
}

export default runScript;