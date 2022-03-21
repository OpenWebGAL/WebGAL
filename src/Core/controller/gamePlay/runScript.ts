import {commandType, ISentence} from "../../interface/scene";
import {say} from "./scripts/say";

export const runScript = (script: ISentence) => {
    switch (script.command) {
        case commandType.say:
            say(script);
            break;
    }
}