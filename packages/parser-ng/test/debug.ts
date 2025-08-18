import *  as fsp from "fs/promises";
import SceneParser, {ADD_NEXT_ARG_LIST, SCRIPT_CONFIG} from "../src";


async function debug() {
  const sceneRaw = await fsp.readFile('test/test-resources/var.txt');
  const sceneText = sceneRaw.toString();

  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const result = parser.parse(sceneText, "var", "/var.txt");
  console.log(result)
  const configFesult = parser.parseConfig(`
Game_name:欢迎使用WebGAL！;
Game_key:0f86dstRf;
Title_img:WebGAL_New_Enter_Image.png;
Title_bgm:s_Title.mp3;
Title_logos: 1.png | 2.png | Image Logo.png| -show -active=false -add=op! -count=3;This is a fake config, do not reference anything.
  `)
  console.log(configFesult)
  console.log(parser.stringifyConfig(configFesult))
}

debug();
