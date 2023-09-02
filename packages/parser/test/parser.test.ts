import SceneParser from "../src/index";
import {ADD_NEXT_ARG_LIST, SCRIPT_CONFIG} from "../src/config/scriptConfig";
import {expect, test} from "vitest";
import {commandType, ISentence} from "../src/interface/sceneInterface";
import * as fsp from 'fs/promises'
import {fileType} from "../src/interface/assets";

test("label", async () => {

  const sceneRaw = await fsp.readFile('test/test-resources/start.txt');
  const sceneText = sceneRaw.toString();

  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const result = parser.parse(sceneText, "start", "/start.txt");
  const expectSentenceItem: ISentence = {
    command: commandType.label,
    commandRaw: "label",
    content: "end",
    args: [
      {key: "next", value: true}
    ],
    sentenceAssets: [],
    subScene: []
  };
  expect(result.sentenceList).toContainEqual(expectSentenceItem);
});

test("args", async () => {

  const sceneRaw = await fsp.readFile('test/test-resources/start.txt');
  const sceneText = sceneRaw.toString();

  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const result = parser.parse(sceneText, "start", "/start.txt");
  const expectSentenceItem: ISentence = {
    command: commandType.changeFigure,
    commandRaw: "changeFigure",
    content: "m2.png",
    args: [
      {key: "left", value: true},
      {key: "next", value: true}
    ],
    sentenceAssets: [{name: "m2.png",url:'m2.png', type: fileType.figure, lineNumber: 0}],
    subScene: []
  };
  expect(result.sentenceList).toContainEqual(expectSentenceItem);
});

test("choose", async () => {

  const sceneRaw = await fsp.readFile('test/test-resources/choose.txt');
  const sceneText = sceneRaw.toString();

  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const result = parser.parse(sceneText, "choose", "/choose.txt");
  const expectSentenceItem: ISentence = {
    command: commandType.choose,
    commandRaw: "choose",
    content: "",
    args: [],
    sentenceAssets: [],
    subScene: []
  };
  expect(result.sentenceList).toContainEqual(expectSentenceItem);
});

test("long-script", async () => {

  const sceneRaw = await fsp.readFile('test/test-resources/long-script.txt');
  const sceneText = sceneRaw.toString();

  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  console.log('line count:', sceneText.split('\n').length)
  console.time('parse-time-consumed')
  const result = parser.parse(sceneText, "start", "/start.txt");
  console.timeEnd('parse-time-consumed')
  const expectSentenceItem: ISentence = {
    command: commandType.label,
    commandRaw: "label",
    content: "end",
    args: [
      {key: "next", value: true}
    ],
    sentenceAssets: [],
    subScene: []
  };
  expect(result.sentenceList).toContainEqual(expectSentenceItem);
});

test("var", async () => {

  const sceneRaw = await fsp.readFile('test/test-resources/var.txt');
  const sceneText = sceneRaw.toString();

  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const result = parser.parse(sceneText, "var", "/var.txt");
  const expectSentenceItem: ISentence = {
    command: commandType.say,
    commandRaw: "WebGAL",
    content: "a=1?",
    args: [{key: 'speaker', value: 'WebGAL'}, {key: 'when', value: "a==1"}],
    sentenceAssets: [],
    subScene: []
  };
  expect(result.sentenceList).toContainEqual(expectSentenceItem);
});
