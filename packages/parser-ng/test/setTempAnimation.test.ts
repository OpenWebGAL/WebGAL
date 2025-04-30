import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual, expectThrow } from './util';

test("setTempAnimation-1", async () => {
    expectContainEqual(`setTempAnimation:[{"position": {"x": 500,"y": 0},"duration": 0}, {"position": {"x": 400,"y": 0},"duration": 250}, {"position": {"x": 600,"y": 0},"duration": 500}, {"position": {"x": 500,"y": 0},"duration": 250}] -target=fig-left -next;`,
        [{
            command: commandType.setTempAnimation,
            commandRaw: "setTempAnimation",
            content: `[{"position": {"x": 500,"y": 0},"duration": 0}, {"position": {"x": 400,"y": 0},"duration": 250}, {"position": {"x": 600,"y": 0},"duration": 500}, {"position": {"x": 500,"y": 0},"duration": 250}]`,
            args: [
                { key: "target", value: "fig-left" },
                { key: "next", value: true }
            ],
            sentenceAssets: [],
            subScene: []
        }]
    );
});