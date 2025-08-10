import SceneParser from "../src/index";
import { ADD_NEXT_ARG_LIST, SCRIPT_CONFIG } from "../src/config/scriptConfig";
import { expect, test } from "vitest";
import { commandType, ISentence } from "../src/interface/sceneInterface";
import * as fsp from 'fs/promises';
import { fileType } from "../src/interface/assets";

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
      { key: "next", value: true }
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
      { key: "left", value: true },
      { key: "next", value: true }
    ],
    sentenceAssets: [{ name: "m2.png", url: 'm2.png', type: fileType.figure, lineNumber: 0 }],
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

  console.log('line count:', sceneText.split('\n').length);
  console.time('parse-time-consumed');
  const result = parser.parse(sceneText, "start", "/start.txt");
  console.timeEnd('parse-time-consumed');
  const expectSentenceItem: ISentence = {
    command: commandType.label,
    commandRaw: "label",
    content: "end",
    args: [
      { key: "next", value: true }
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
    args: [{ key: 'speaker', value: 'WebGAL' }, { key: 'when', value: "a==1" }],
    sentenceAssets: [],
    subScene: []
  };
  expect(result.sentenceList).toContainEqual(expectSentenceItem);
});

test("config", async () => {
  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const configFesult = parser.parseConfig(`
Game_name:欢迎使用WebGAL！;
Game_key:0f86dstRf;
Title_img:WebGAL_New_Enter_Image.webp;
Title_bgm:s_Title.mp3;
Title_logos: 1.png | 2.png | Image Logo.png| -show -active=false -add=op! -count=3;This is a fake config, do not reference anything.
  `);
  expect(configFesult).toContainEqual({
    command: 'Title_logos',
    args: ['1.png', '2.png', 'Image Logo.png'],
    options: [
      { key: 'show', value: true },
      { key: 'active', value: false },
      { key: 'add', value: 'op!' },
      { key: 'count', value: 3 },
    ]
  });
});

test("config-stringify", async () => {
  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const configFesult = parser.parseConfig(`
Game_name:欢迎使用WebGAL！;
Game_key:0f86dstRf;
Title_img:WebGAL_New_Enter_Image.webp;
Title_bgm:s_Title.mp3;
Title_logos: 1.png | 2.png | Image Logo.png| -show -active=false -add=op! -count=3;This is a fake config, do not reference anything.
  `);
  const stringifyResult = parser.stringifyConfig(configFesult);
  const configResult2 = parser.parseConfig(stringifyResult);
  expect(configResult2).toContainEqual({
    command: 'Title_logos',
    args: ['1.png', '2.png', 'Image Logo.png'],
    options: [
      { key: 'show', value: true },
      { key: 'active', value: false },
      { key: 'add', value: 'op!' },
      { key: 'count', value: 3 },
    ]
  });
});


test("say statement", async () => {
  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const result = parser.parse(`say:123 -speaker=xx;`, 'test', 'test');
  expect(result.sentenceList).toContainEqual({
    command: commandType.say,
    commandRaw: "say",
    content: "123",
    args: [{ key: 'speaker', value: 'xx' }],
    sentenceAssets: [],
    subScene: []
  });
});

test("wait command", async () => {
  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const result = parser.parse(`wait:1000;`, 'test', 'test');
  expect(result.sentenceList).toContainEqual({
    command: commandType.wait,
    commandRaw: "wait",
    content: "1000",
    args: [],
    sentenceAssets: [],
    subScene: []
  });
});

test("changeFigure with duration and animation args", async () => {
  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const result = parser.parse(`changeFigure:stand.webp -duration=1000 -enter=fadeIn -exit=fadeOut;`, 'test', 'test');
  expect(result.sentenceList).toContainEqual({
    command: commandType.changeFigure,
    commandRaw: "changeFigure",
    content: "stand.webp",
    args: [
      { key: 'duration', value: 1000 },
      { key: 'enter', value: 'fadeIn' },
      { key: 'exit', value: 'fadeOut' }
    ],
    sentenceAssets: [{ name: "stand.webp", url: 'stand.webp', type: fileType.figure, lineNumber: 0 }],
    subScene: []
  });
});

test("changeBg with animation parameters", async () => {
  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const result = parser.parse(`changeBg:background.jpg -duration=2000 -enter=slideIn -transform={"alpha":0.8};`, 'test', 'test');
  expect(result.sentenceList).toContainEqual({
    command: commandType.changeBg,
    commandRaw: "changeBg",
    content: "background.jpg",
    args: [
      { key: 'duration', value: 2000 },
      { key: 'enter', value: 'slideIn' },
      { key: 'transform', value: '{"alpha":0.8}' }
    ],
    sentenceAssets: [{ name: "background.jpg", url: 'background.jpg', type: fileType.background, lineNumber: 0 }],
    subScene: []
  });
});
