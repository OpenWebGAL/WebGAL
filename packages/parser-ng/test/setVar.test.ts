import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual, expectThrow } from './util';

test("setVar-1", async () => {
    expectContainEqual(`setVar:a=1; // 可以设置数字`,
        [{
            command: commandType.setVar,
            commandRaw: "setVar",
            content: "",
            args: [
                { key: "#variableName", value: "a" },
                { key: "#expression", value: 1 }
            ],
            sentenceAssets: [],
            subScene: []
        }]
    );
});

test("setVar-2", async () => {
    expectContainEqual(`setVar:a=true; // 可以设置布尔值`,
        [{
            command: commandType.setVar,
            commandRaw: "setVar",
            content: "",
            args: [
                { key: "#variableName", value: "a" },
                { key: "#expression", value: true }
            ],
            sentenceAssets: [],
            subScene: []
        }]
    );
});

test("setVar-3", async () => {
    expectContainEqual(`setVar:a=人物名称; // 可以设置字符串`,
        [{
            command: commandType.setVar,
            commandRaw: "setVar",
            content: "",
            args: [
                { key: "#variableName", value: "a" },
                { key: "#expression", value: "人物名称" }
            ],
            sentenceAssets: [],
            subScene: []
        }]
    );
});

test("setVar-4", async () => {
    expectContainEqual(`setVar:a=random();`,
        [{
            command: commandType.setVar,
            commandRaw: "setVar",
            content: "",
            args: [
                { key: "#variableName", value: "a" },
                { key: "#expression", value: "random()" }
            ],
            sentenceAssets: [],
            subScene: []
        }]
    );
});

test("setVar-5", async () => {
    expectContainEqual(`setVar:a=5+a*5;`,
        [{
            command: commandType.setVar,
            commandRaw: "setVar",
            content: "",
            args: [
                { key: "#variableName", value: "a" },
                { key: "#expression", value: "5+a*5" }
            ],
            sentenceAssets: [],
            subScene: []
        }]
    );
});

test("setVar-6", async () => {
    expectContainEqual(`setVar:a=5+a*5;`,
        [{
            command: commandType.setVar,
            commandRaw: "setVar",
            content: "",
            args: [
                { key: "#variableName", value: "a" },
                { key: "#expression", value: "5+a*5" }
            ],
            sentenceAssets: [],
            subScene: []
        }]
    );
});

test("setVar-7", async () => {
    expectContainEqual(`setVar:a=1;
setVar:b=a+1;`, [
        {
            command: commandType.setVar,
            commandRaw: "setVar",
            content: "",
            args: [
                { key: "#variableName", value: "a" },
                { key: "#expression", value: 1 }
            ],
            sentenceAssets: [],
            subScene: []
        },
        {
            command: commandType.setVar,
            commandRaw: "setVar",
            content: "",
            args: [
                { key: "#variableName", value: "b" },
                { key: "#expression", value: "a+1" }
            ],
            sentenceAssets: [],
            subScene: []
        },
    ]);
});

test("setVar-8", async () => {
    expectContainEqual(`setVar:a=1 -global;`,
        [{
            command: commandType.setVar,
            commandRaw: "setVar",
            content: "",
            args: [
                { key: "#variableName", value: "a" },
                { key: "#expression", value: 1 },
                { key: "global", value: true }
            ],
            sentenceAssets: [],
            subScene: []
        }]
    );
});

test("setVar-9", async () => {
    expectContainEqual(`setVar:a=($stage.bgm.volume) -global;`,
        [{
            command: commandType.setVar,
            commandRaw: "setVar",
            content: "",
            args: [
                { key: "#variableName", value: "a" },
                { key: "#internalExpression", value: "$stage.bgm.volume" },
                { key: "global", value: true }
            ],
            sentenceAssets: [],
            subScene: []
        }]
    );
});
