
import SceneParser, { parserSyntaxError } from "../src/index";
import { ADD_NEXT_ARG_LIST, SCRIPT_CONFIG } from "../src/config/scriptConfig";
import { expect } from "vitest";
import { IError, ISentence } from "../src/interface/sceneInterface";
import { chai } from 'vitest';

chai.config.truncateThreshold = 100000;

export function expectContainEqual(rawScene: string, expectedSentenceItem: Array<ISentence>, errors: Array<IError> = []) {
    const parser = new SceneParser((assetList) => {
    }, (fileName, assetType) => {
        return fileName;
    }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

    const result = parser.parse(rawScene, "start", "/start.txt");

    expect(result.sentenceList).toEqual(expectedSentenceItem);
    // if (Array.isArray(expectedSentenceItem)) {
    //     expectedSentenceItem.forEach((s) => expect(result.sentenceList).toContainEqual(s));
    // } else {
    //     expect(result.sentenceList).toEqual(expectedSentenceItem);
    // }

    if (errors) {
        for (const error of errors) {
            expect(result.errors).toContainEqual(error);
        }
    }
}

export function expectThrow(rawScene: string) {
    const parser = new SceneParser((assetList) => {
    }, (fileName, assetType) => {
        return fileName;
    }, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

    expect(() => parser.parse(rawScene, "start", "/start.txt")).toThrow(parserSyntaxError);
}