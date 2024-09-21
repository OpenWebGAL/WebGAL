import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual } from './util';

test("getUserInput-1", async () => {
    expectContainEqual(`getUserInput:name -title=如何称呼你 -buttonText=确认; 将用户输入写入 name 变量中`, 
        [{
            command: commandType.getUserInput,
            commandRaw: "getUserInput",
            content: "name",
            args: [
                { key: "title", value: "如何称呼你" },
                { key: "buttonText", value: "确认" }
            ],
            sentenceAssets: [],
            subScene: []
        }]
    );
});
