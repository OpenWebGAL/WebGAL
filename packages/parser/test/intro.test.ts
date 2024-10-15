import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual, expectThrow } from './util';

test("intro-1", async () => {
    expectContainEqual(`intro:回忆不需要适合的剧本，|反正一说出口，|都成了戏言。;`,
        [{
            command: commandType.intro,
            commandRaw: "intro",
            content: "回忆不需要适合的剧本，|反正一说出口，|都成了戏言。",
            args: [],
            sentenceAssets: [],
            subScene: []
        }]
    );
});

test("intro-2", async () => {
    expectContainEqual(`intro:回忆不需要适合的剧本，|反正一说出口，|都成了戏言。 -hold;`,
        [{
            command: commandType.intro,
            commandRaw: "intro",
            content: "回忆不需要适合的剧本，|反正一说出口，|都成了戏言。",
            args: [{ key: "hold", value: true }],
            sentenceAssets: [],
            subScene: []
        }]
    );
});

test("intro-3", async () => {
    expectContainEqual(`intro:你好|欢迎来到 WebGAL 的世界;`,
        [{
            command: commandType.intro,
            commandRaw: "intro",
            content: "你好|欢迎来到 WebGAL 的世界",
            args: [],
            sentenceAssets: [],
            subScene: []
        }]
    );
});
