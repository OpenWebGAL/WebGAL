import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual } from './util';

test("end-1", async () => {
    expectContainEqual(`end;`,
        [{
            command: commandType.end,
            commandRaw: "end",
            content: "",
            args: [],
            sentenceAssets: [],
            subScene: []
        }]
    );
});
