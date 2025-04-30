import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual, expectThrow } from './util';

test("setTextbox-1", async () => {
    expectContainEqual(`setTextbox:hide; // 关闭文本框`,
        [{
            command: commandType.setTextbox,
            commandRaw: "setTextbox",
            content: "hide",
            args: [],
            sentenceAssets: [],
            subScene: []
        }]
    );
});

test("setTextbox-2", async () => {
    expectContainEqual(`setTextbox:on; // 可以是除 hide 以外的任意值。`,
        [{
            command: commandType.setTextbox,
            commandRaw: "setTextbox",
            content: "on",
            args: [],
            sentenceAssets: [],
            subScene: []
        }]
    );
});
