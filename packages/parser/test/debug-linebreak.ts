import {sceneTextPreProcess} from "../src/sceneTextPreProcessor";
import *  as fsp from "fs/promises";


async function debug() {
  const sceneRaw = await fsp.readFile('test/test-resources/line-break.txt');
  const sceneText = sceneRaw.toString();
  const result = sceneTextPreProcess(sceneText)
  console.log(result)
  console.log(result.split('\n').length)
}

debug();
