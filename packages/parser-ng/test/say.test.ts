import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual, expectThrow } from './util';
import { fileType } from "../src/interface/assets";

test("say-1", async () => {
  expectContainEqual(`雪之下雪乃:你到得真早;`,
    [{
      command: commandType.say,
      commandRaw: "雪之下雪乃",
      content: "你到得真早",
      args: [
        { key: "speaker", value: "雪之下雪乃" },
      ],
      sentenceAssets: [],
      subScene: []
    }]
  );
});

test("say-2", async () => {
  expectContainEqual(`对不起，等很久了吗？;`,
    [{
      command: commandType.say,
      commandRaw: "say",
      content: "对不起，等很久了吗？",
      args: [],
      sentenceAssets: [],
      subScene: []
    }]
  );
});

test("say-3", async () => {
  expectContainEqual(`:这是一句旁白;`,
    [{
      command: commandType.say,
      commandRaw: "",
      content: "这是一句旁白",
      args: [
        { key: "speaker", value: "" },
      ],
      sentenceAssets: [],
      subScene: []
    }]
  );
});

test("say-4", async () => {
  expectContainEqual(`WebGAL:a=1? -when=a==1;`,
    [{
      command: commandType.say,
      commandRaw: "WebGAL",
      content: "a=1?",
      args: [
        { key: "speaker", value: "WebGAL" },
        { key: "when", value: "a==1" },
      ],
      sentenceAssets: [],
      subScene: []
    }]
  );
});

test("say-5", async () => {
  expectContainEqual(`WebGAL: 你 打 字 带 空 格 -when=a==1;`,
    [{
      command: commandType.say,
      commandRaw: "WebGAL",
      content: "你 打 字 带 空 格",
      args: [
        { key: "speaker", value: "WebGAL" },
        { key: "when", value: "a==1" },
      ],
      sentenceAssets: [],
      subScene: []
    }]
  );
});

test("say-6", async () => {
  expectContainEqual(`WebGAL: 你 打 字 带 空 格 -when=a==1;`,
    [{
      command: commandType.say,
      commandRaw: "WebGAL",
      content: "你 打 字 带 空 格",
      args: [
        { key: "speaker", value: "WebGAL" },
        { key: "when", value: "a==1" },
      ],
      sentenceAssets: [],
      subScene: []
    }]
  );
});

test("say-7", async () => {
  expectContainEqual(`比企谷八幡:刚到而已 -V3.ogg -volume=30;`,
    [{
      command: commandType.say,
      commandRaw: "比企谷八幡",
      content: "刚到而已",
      args: [
        { key: "speaker", value: "比企谷八幡" },
        { key: "vocal", value: "V3.ogg" },
        { key: "volume", value: 30 },
      ],
      sentenceAssets: [{ name: 'V3.ogg', url: 'V3.ogg', lineNumber: 0, type: fileType.vocal }],
      subScene: []
    }]
  );
});
