import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual } from './util';

test("showVars-1", async () => {
    expectContainEqual(`showVars;`,
        [{
            command: commandType.showVars,
            commandRaw: "showVars",
            content: "",
            args: [],
            sentenceAssets: [],
            subScene: []
        }]
    );
});
