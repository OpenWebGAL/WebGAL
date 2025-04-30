import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual, expectThrow } from './util';
import { fileType } from "../src/interface/assets";

test("comment-1", async () => {
    expectContainEqual(`
`,
        [{
            command: commandType.comment,
            commandRaw: "comment",
            content: "",
            args: [],
            sentenceAssets: [],
            subScene: []
        }]);
});
