import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual, expectThrow } from './util';

test("setAnimation-1", async () => {
    expectContainEqual(`; // 为中间立绘设置一个从下方进入的动画，并转到下一句
setAnimation:enter-from-bottom -target=fig-center -next;`,
        [
            {
                command: commandType.comment,
                commandRaw: "comment",
                content: " // 为中间立绘设置一个从下方进入的动画，并转到下一句",
                args: [],
                sentenceAssets: [],
                subScene: []
            },
            {
            command: commandType.setAnimation,
            commandRaw: "setAnimation",
            content: "enter-from-bottom",
            args: [
                { key: "target", value: "fig-center" },
                { key: "next", value: true },
            ],
            sentenceAssets: [],
            subScene: []
            }
        ]);
});
