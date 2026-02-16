import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual, expectThrow } from './util';

test("setTransition-1", async () => {
    expectContainEqual(`setTransition: -target=fig-center -enter=enter-from-bottom -exit=exit;`,
        [{
            command: commandType.setTransition,
            commandRaw: "setTransition",
            content: "",
            args: [
                { key: "target", value: "fig-center" },
                { key: "enter", value: "enter-from-bottom" },
                { key: "exit", value: "exit" },
            ],
            sentenceAssets: [],
            subScene: []
        }]
    );
});
