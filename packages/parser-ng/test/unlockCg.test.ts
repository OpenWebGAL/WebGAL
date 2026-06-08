import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual, expectThrow } from './util';

test("unlockCg-1", async () => {
    expectContainEqual(`; // 解锁CG并赋予名称
unlockCg:xgmain.jpeg -name=星光咖啡馆与死神之蝶 -series=1;`,
        [
            {
                command: commandType.comment,
                commandRaw: "comment",
                content: " // 解锁CG并赋予名称",
                args: [],
                sentenceAssets: [],
                subScene: []
            },
            {
                command: commandType.unlockCg,
                commandRaw: "unlockCg",
                content: "xgmain.jpeg",
                args: [
                    { key: "name", value: "星光咖啡馆与死神之蝶" },
                    { key: "series", value: 1 }
                ],
                sentenceAssets: [],
                subScene: []
            }
        ]);
});
