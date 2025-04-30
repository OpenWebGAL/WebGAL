import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual, expectThrow } from './util';
import { fileType } from "../src/interface/assets";

test("playVideo-1", async () => {
    expectContainEqual(`playVideo:OP.mp4;`,
        [{
            command: commandType.video,
            commandRaw: "playVideo",
            content: "OP.mp4",
            args: [],
            sentenceAssets: [{ name: 'OP.mp4', url: 'OP.mp4', lineNumber: 0, type: fileType.video }],
            subScene: []
        }]
    );
});
