import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual, expectThrow } from './util';

test("jumpLabel-1", async () => {
    expectContainEqual(`jumpLabel:label_1; // 跳转到 label_1`,
        [{
            command: commandType.jumpLabel,
            commandRaw: "jumpLabel",
            content: "label_1",
            args: [],
            sentenceAssets: [],
            subScene: []
        }]
    );
});
