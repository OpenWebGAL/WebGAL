import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual, expectThrow } from './util';

test("filmMode-1", async () => {
    expectContainEqual(`filmMode:Film Mode Test;`,
        [{
            command: commandType.filmMode,
            commandRaw: "filmMode",
            content: "Film Mode Test",
            args: [],
            sentenceAssets: [],
            subScene: []
        }]
    );
});

test("filmMode-2", async () => {
    expectContainEqual(`filmMode:none;`,
        [{
            command: commandType.filmMode,
            commandRaw: "filmMode",
            content: "",
            args: [],
            sentenceAssets: [],
            subScene: []
        }]
    );
});

test("filmMode-3", async () => {
    expectContainEqual(`filmMode:;`,
        [{
            command: commandType.filmMode,
            commandRaw: "filmMode",
            content: "",
            args: [],
            sentenceAssets: [],
            subScene: []
        }]
    );
});
