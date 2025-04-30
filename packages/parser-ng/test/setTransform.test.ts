import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual, expectThrow } from './util';

test("setTransform-1", async () => {
    expectContainEqual(`setTransform:{"position":{"x":100,"y":0}} -target=fig-center -duration=0;`,
        [{
            command: commandType.setTransform,
            commandRaw: "setTransform",
            content: '{"position":{"x":100,"y":0}}',
            args: [
                { key: "target", value: "fig-center" },
                { key: "duration", value: 0 }
            ],
            sentenceAssets: [],
            subScene: []
        }]
    );
});
