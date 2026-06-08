import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual, expectThrow } from './util';

test("callScene-1", async () => {
    expectContainEqual(`callScene:Chapter-2.txt;`,
        [{
            command: commandType.callScene,
            commandRaw: "callScene",
            content: "Chapter-2.txt",
            args: [],
            sentenceAssets: [],
            subScene: ["Chapter-2.txt"]
        }]
    );
});
