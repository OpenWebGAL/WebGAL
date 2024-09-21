import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual, expectThrow } from './util';

test("pixi-1", async () => {
    expectContainEqual(`pixiInit;`,
        [{
            command: commandType.pixiInit,
            commandRaw: "pixiInit",
            content: "",
            args: [],
            sentenceAssets: [],
            subScene: []
        }]
    );
});

test("pixi-2", async () => {
    expectContainEqual(`pixiPerform:rain; // 添加一个下雨的特效`,
        [{
            command: commandType.pixi,
            commandRaw: "pixiPerform",
            content: "rain",
            args: [],
            sentenceAssets: [],
            subScene: []
        }]
    );
});
