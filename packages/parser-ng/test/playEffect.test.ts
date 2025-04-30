import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual, expectThrow } from './util';

test("playEffect-1", async () => {
    expectContainEqual(`playEffect:xxx.mp3;`,
        [{
            command: commandType.playEffect,
            commandRaw: "playEffect",
            content: "xxx.mp3",
            args: [],
            sentenceAssets: [],
            subScene: []
        }]
    );
});

test("playEffect-2", async () => {
    expectContainEqual(`playEffect:xxx.mp3 -volume=30;`,
        [{
            command: commandType.playEffect,
            commandRaw: "playEffect",
            content: "xxx.mp3",
            args: [{ key: "volume", value: 30 }],
            sentenceAssets: [],
            subScene: []
        }]
    );
});

test("playEffect-3", async () => {
    expectContainEqual(`playEffect:xxx.mp3 -id=xxx;
playEffect:none -id=xxx; // 停止这个循环的效果音`, [
        {
            command: commandType.playEffect,
            commandRaw: "playEffect",
            content: "xxx.mp3",
            args: [{ key: "id", value: "xxx" }],
            sentenceAssets: [],
            subScene: []
        },
        {
            command: commandType.playEffect,
            commandRaw: "playEffect",
            content: "",
            args: [{ key: "id", value: "xxx" }],
            sentenceAssets: [],
            subScene: []
        }
    ]);
});
