import *  as fsp from "fs/promises";
import SceneParser, {ADD_NEXT_ARG_LIST, SCRIPT_CONFIG} from "../src";


async function debug() {
  const sceneRaw = await fsp.readFile('test/test-resources/debug.scss');
  const sceneText = sceneRaw.toString();

  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const configFesult = parser.parseScssToWebgalStyleObj(sceneText)
  console.log(configFesult)
}

debug();
