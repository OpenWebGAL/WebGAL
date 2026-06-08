import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual, expectThrow } from './util';

test("changeScene-1", async () => {
    expectContainEqual(`changeScene:Chapter-2.txt;`,
        [{
            command: commandType.changeScene,
            commandRaw: "changeScene",
            content: "Chapter-2.txt",
            args: [],
            sentenceAssets: [],
            subScene: ["Chapter-2.txt"]
        }]
    );
});
