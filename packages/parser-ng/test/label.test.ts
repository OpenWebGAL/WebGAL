import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual, expectThrow } from './util';

test("label-1", async () => {
    expectContainEqual(`label:label_1; // 创建名为 label_1 的 label`,
        [{
            command: commandType.label,
            commandRaw: "label",
            content: "label_1",
            args: [],
            sentenceAssets: [],
            subScene: []
        }]
    );
});
