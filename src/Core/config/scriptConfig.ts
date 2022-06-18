import {IConfigInterface} from "@/interface/coreInterface/configInterface";
import {commandType} from "@/interface/coreInterface/sceneInterface";
import {intro} from "@/Core/gameScripts/intro";
import {changeBg} from "@/Core/gameScripts/changeBg";
import {changeFigure} from "@/Core/gameScripts/changeFigure";
import {miniAvatar} from "@/Core/gameScripts/miniAvatar";
import {changeSceneScript} from "@/Core/gameScripts/changeSceneScript";
import {choose} from "@/Core/gameScripts/choose";
import { end } from "../gameScripts/end";
import {bgm} from "@/Core/gameScripts/bgm";
import {playVideo} from "@/Core/gameScripts/playVideo";
import {setBgAni} from "@/Core/gameScripts/setBgAni";
import {setFigAni} from "@/Core/gameScripts/setFigAni";
import {setBgTransform} from "@/Core/gameScripts/setBgTransform";
import {setBgFilter} from "@/Core/gameScripts/setBgFilter";
import {setFigTransform} from "@/Core/gameScripts/setFigTransform";
import { setFigFilter } from "../gameScripts/setFigFilter";
import { pixiInit } from "../gameScripts/pixiInit";
import {pixi} from "@/Core/gameScripts/pixi";
import {label} from "@/Core/gameScripts/label";
import { jumpLabel } from "../gameScripts/jumpLabel";
import { setVar } from "../gameScripts/setVar";
import { showVars } from "../gameScripts/showVars";
import {unlockCg} from "@/Core/gameScripts/unlockCg";
import {unlockBgm} from "@/Core/gameScripts/unlockBgm";
import { say } from "../gameScripts/say";
import {filmMode} from "@/Core/gameScripts/filmMode";

export const scriptConfig: IConfigInterface[] = [
  {scriptString:'intro',scriptType:commandType.intro,scriptFunction:intro},
  {scriptString:'changeBg',scriptType:commandType.changeBg,scriptFunction:changeBg},
  {scriptString:'changeFigure',scriptType:commandType.changeFigure,scriptFunction:changeFigure},
  {scriptString:'miniAvatar',scriptType:commandType.miniAvatar,scriptFunction:miniAvatar},
  {scriptString:'changeScene',scriptType:commandType.changeScene,scriptFunction:changeSceneScript},
  {scriptString:'choose',scriptType:commandType.choose,scriptFunction:choose},
  {scriptString:'end',scriptType:commandType.end,scriptFunction:end},
  {scriptString:'bgm',scriptType:commandType.bgm,scriptFunction:bgm},
  {scriptString:'playVideo',scriptType:commandType.video,scriptFunction:playVideo},
  {scriptString:'setBgAni',scriptType:commandType.perform_bgAni,scriptFunction:setBgAni},
  {scriptString:'setFigAni',scriptType:commandType.perform_FigAni,scriptFunction:setFigAni},
  {scriptString:'setBgTransform',scriptType:commandType.setBgTransform,scriptFunction:setBgTransform},
  {scriptString:'setBgFilter',scriptType:commandType.setBgFilter,scriptFunction:setBgFilter},
  {scriptString:'setFigTransform',scriptType:commandType.setFigTransform,scriptFunction:setFigTransform},
  {scriptString:'setFigFilter',scriptType:commandType.setFigFilter,scriptFunction:setFigFilter},
  {scriptString:'pixiInit',scriptType:commandType.pixiInit,scriptFunction:pixiInit},
  {scriptString:'pixiPerform',scriptType:commandType.pixi,scriptFunction:pixi},
  {scriptString:'label',scriptType:commandType.label,scriptFunction:label},
  {scriptString:'jumpLabel',scriptType:commandType.jumpLabel,scriptFunction:jumpLabel},
  // {scriptString:'chooseLabel',scriptType:commandType.chooseLabel,scriptFunction:setFigFilter},
  {scriptString:'setVar',scriptType:commandType.setVar,scriptFunction:setVar},
  {scriptString:'callScene',scriptType:commandType.callScene,scriptFunction:changeSceneScript},
  {scriptString:'showVars',scriptType:commandType.showVars,scriptFunction:showVars},
  {scriptString:'unlockCg',scriptType:commandType.unlockCg,scriptFunction:unlockCg},
  {scriptString:'unlockBgm',scriptType:commandType.unlockBgm,scriptFunction:unlockBgm},
  {scriptString:'say',scriptType:commandType.say,scriptFunction:say},
  {scriptString:'filmMode',scriptType:commandType.filmMode,scriptFunction:filmMode},
];
export const addNextArgList = [
  commandType.bgm,
  commandType.pixi,
  commandType.pixiInit,
  commandType.label,
  commandType.if,
  commandType.miniAvatar,
  commandType.setBgTransform,
  commandType.setBgFilter,
  commandType.setFigFilter,
  commandType.setFigTransform,
  commandType.perform_FigAni,
  commandType.perform_bgAni,
  commandType.setVar,
  commandType.unlockBgm,
  commandType.unlockCg,
  commandType.filmMode,
];

