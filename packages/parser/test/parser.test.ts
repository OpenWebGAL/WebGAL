import SceneParser from "../src/index";
import { ADD_NEXT_ARG_LIST, SCRIPT_CONFIG } from "../src/config/scriptConfig";
import { expect, test } from "vitest";
import { commandType, IAsset, ISentence } from "../src/interface/sceneInterface";
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
    subScene: [],
    inlineComment: ""
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
    sentenceAssets: [{ name: "m2.png", url: 'm2.png', type: fileType.figure, lineNumber: 24 }],
    subScene: [],
    inlineComment: ""
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
    subScene: [],
    inlineComment: ""
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
    subScene: [],
    inlineComment: ""
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
    subScene: [],
    inlineComment: ""
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
  const expectSentenceItem: ISentence = {
    command: commandType.say,
    commandRaw: "say",
    content: "123",
    args: [{ key: 'speaker', value: 'xx' }],
    sentenceAssets: [],
    subScene: [],
    inlineComment: ""
  };
  expect(result.sentenceList).toContainEqual(expectSentenceItem);
});

test("say statement applies asset setter to vocal named argument", async () => {
  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    if (assetType === fileType.vocal) {
      return `./game/vocal/${fileName}`;
    }
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const result = parser.parse(`say:123 -speaker=xx -vocal=a.mp3;`, 'test', 'test');
  const sentence = result.sentenceList[0];

  expect(sentence.args).toContainEqual({ key: 'vocal', value: './game/vocal/a.mp3' });
  expect(sentence.sentenceAssets).toContainEqual({
    name: './game/vocal/a.mp3',
    url: './game/vocal/a.mp3',
    type: fileType.vocal,
    lineNumber: 0,
  });
});

test("scene assets are deduplicated by type and url", async () => {
  let prefetchedAssets: IAsset[] = [];
  const parser = new SceneParser((assetList) => {
    prefetchedAssets = assetList;
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const result = parser.parse(`changeBg:shared.webp;
changeFigure:shared.webp;
changeBg:shared.webp;`, 'test', 'test');

  expect(result.assetsList).toEqual([
    { name: "shared.webp", url: 'shared.webp', type: fileType.background, lineNumber: 0 },
    { name: "shared.webp", url: 'shared.webp', type: fileType.figure, lineNumber: 1 },
  ]);
  expect(prefetchedAssets).toEqual(result.assetsList);
});

test("scene assets skip entries with empty urls", async () => {
  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    if (assetType === fileType.vocal) {
      return '';
    }
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const result = parser.parse(`say:123 -vocal=missing.mp3;`, 'test', 'test');

  expect(result.assetsList).toEqual([]);
});

test("wait command", async () => {
  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const result = parser.parse(`wait:1000;`, 'test', 'test');
  const expectSentenceItem: ISentence = {
    command: commandType.wait,
    commandRaw: "wait",
    content: "1000",
    args: [],
    sentenceAssets: [],
    subScene: [],
    inlineComment: ""
  };
  expect(result.sentenceList).toContainEqual(expectSentenceItem);
});

test("changeFigure with duration and animation args", async () => {
  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const result = parser.parse(`changeFigure:stand.webp -duration=1000 -enter=fadeIn -exit=fadeOut;`, 'test', 'test');
  const expectSentenceItem: ISentence = {
    command: commandType.changeFigure,
    commandRaw: "changeFigure",
    content: "stand.webp",
    args: [
      { key: 'duration', value: 1000 },
      { key: 'enter', value: 'fadeIn' },
      { key: 'exit', value: 'fadeOut' }
    ],
    sentenceAssets: [{ name: "stand.webp", url: 'stand.webp', type: fileType.figure, lineNumber: 0 }],
    subScene: [],
    inlineComment: ""
  };
  expect(result.sentenceList).toContainEqual(expectSentenceItem);
});

test("changeBg with animation parameters", async () => {
  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const result = parser.parse(`changeBg:background.jpg -duration=2000 -enter=slideIn -transform={"alpha":0.8};`, 'test', 'test');
  const expectSentenceItem: ISentence = {
    command: commandType.changeBg,
    commandRaw: "changeBg",
    content: "background.jpg",
    args: [
      { key: 'duration', value: 2000 },
      { key: 'enter', value: 'slideIn' },
      { key: 'transform', value: '{"alpha":0.8}' }
    ],
    sentenceAssets: [{ name: "background.jpg", url: 'background.jpg', type: fileType.background, lineNumber: 0 }],
    subScene: [],
    inlineComment: ""
  };
  expect(result.sentenceList).toContainEqual(expectSentenceItem);
});

test("inline comment is preserved on normal statement", async () => {
  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const result = parser.parse(`say:123 -speaker=xx; // this is an inline comment`, 'test', 'test');
  const expectSentenceItem: ISentence = {
    command: commandType.say,
    commandRaw: "say",
    content: "123",
    args: [{ key: 'speaker', value: 'xx' }],
    sentenceAssets: [],
    subScene: [],
    inlineComment: "// this is an inline comment"
  };
  expect(result.sentenceList).toContainEqual(expectSentenceItem);
});

test("escaped semicolon is preserved in content and inline comment is preserved", async () => {
  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const result = parser.parse(String.raw`say:price\;100;comment-part`, 'test', 'test');
  const expectSentenceItem: ISentence = {
    command: commandType.say,
    commandRaw: "say",
    content: "price;100",
    args: [],
    sentenceAssets: [],
    subScene: [],
    inlineComment: "comment-part"
  };
  expect(result.sentenceList).toContainEqual(expectSentenceItem);
});

test("inline comment preserves following semicolons", async () => {
  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const result = parser.parse(`say:123; first; second; third`, 'test', 'test');
  const expectSentenceItem: ISentence = {
    command: commandType.say,
    commandRaw: "say",
    content: "123",
    args: [],
    sentenceAssets: [],
    subScene: [],
    inlineComment: "first; second; third"
  };
  expect(result.sentenceList).toContainEqual(expectSentenceItem);
});

test("comment-only line keeps comment in content", async () => {
  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const result = parser.parse(`; only comment here`, 'test', 'test');
  const expectSentenceItem: ISentence = {
    command: commandType.comment,
    commandRaw: "comment",
    content: "only comment here",
    args: [{ key: 'next', value: true }],
    sentenceAssets: [],
    subScene: [],
    inlineComment: ""
  };
  expect(result.sentenceList).toContainEqual(expectSentenceItem);
});

test("comment-only line preserves following semicolons", async () => {
  const parser = new SceneParser((assetList) => {
  }, (fileName, assetType) => {
    return fileName;
  }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

  const result = parser.parse(`; first; second; third`, 'test', 'test');
  const expectSentenceItem: ISentence = {
    command: commandType.comment,
    commandRaw: "comment",
    content: "first; second; third",
    args: [{ key: 'next', value: true }],
    sentenceAssets: [],
    subScene: [],
    inlineComment: ""
  };
  expect(result.sentenceList).toContainEqual(expectSentenceItem);
});
