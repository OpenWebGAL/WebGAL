import { test } from "vitest";
import { commandType } from "../src/interface/sceneInterface";
import { expectContainEqual, expectThrow } from './util';

test("choose-1", async () => {
    expectContainEqual(`choose:叫住她:Chapter-2.txt|回家:Chapter-3.txt;`,
        [{
            command: commandType.choose,
            commandRaw: "choose",
            content: "叫住她:Chapter-2.txt|回家:Chapter-3.txt",
            args: [
                {
                    key: "choices",
                    value: [
                        {
                            showExpression: "",
                            clickExpression: "",
                            text: "叫住她",
                            destination: "Chapter-2.txt"
                        },
                        {
                            showExpression: "",
                            clickExpression: "",
                            text: "回家",
                            destination: "Chapter-3.txt"
                        }
                    ]
                },
                {
                    key: "contentRawRange",
                    value: [7, 41],
                }
            ],
            sentenceAssets: [],
            subScene: ["Chapter-2.txt", "Chapter-3.txt"]
        }]);
});

test("choose-2", async () => {
    expectContainEqual(`choose:(showConditionVar>1)[enableConditionVar>2]->叫住她:Chapter-2.txt|回家:Chapter-3.txt;`,
        [{
            command: commandType.choose,
            commandRaw: "choose",
            content: "(showConditionVar>1)[enableConditionVar>2]->叫住她:Chapter-2.txt|回家:Chapter-3.txt",
            args: [
                {
                    key: "choices",
                    value: [
                        {
                            showExpression: "showConditionVar>1",
                            clickExpression: "enableConditionVar>2",
                            text: "叫住她",
                            destination: "Chapter-2.txt"
                        },
                        {
                            showExpression: "",
                            clickExpression: "",
                            text: "回家",
                            destination: "Chapter-3.txt"
                        }
                    ]
                },
                {
                    key: "contentRawRange",
                    value: [7, 85],
                }
            ],
            sentenceAssets: [],
            subScene: ["Chapter-2.txt", "Chapter-3.txt"]
        }]
    );
});

test("choose-3", async () => {
    expectContainEqual(`choose:分支 1:label_1|分支 2:label_2;`,
        [{
            command: commandType.choose,
            commandRaw: "choose",
            content: "分支 1:label_1|分支 2:label_2",
            args: [
                {
                    key: "choices",
                    value: [
                        {
                            showExpression: "",
                            clickExpression: "",
                            text: "分支 1",
                            destination: "label_1"
                        },
                        {
                            showExpression: "",
                            clickExpression: "",
                            text: "分支 2",
                            destination: "label_2"
                        }
                    ]
                },
                {
                    key: "contentRawRange",
                    value: [7, 32],
                }
            ],
            sentenceAssets: [],
            subScene: []
        }]);
});
