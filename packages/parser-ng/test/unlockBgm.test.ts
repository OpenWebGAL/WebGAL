import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual, expectThrow } from './util';

test("unlockBgm-1", async () => {
    expectContainEqual(`; // 解锁bgm并赋予名称
unlockBgm:s_Title.mp3 -name=Smiling-Swinging!!!;`,
        [
            {
                command: commandType.comment,
                commandRaw: "comment",
                content: " // 解锁bgm并赋予名称",
                args: [],
                sentenceAssets: [],
                subScene: []
            },
            {
                command: commandType.unlockBgm,
                commandRaw: "unlockBgm",
                content: "s_Title.mp3",
                args: [
                    { key: "name", value: "Smiling-Swinging!!!" },
                ],
                sentenceAssets: [],
                subScene: []
            }
        ]);
});
