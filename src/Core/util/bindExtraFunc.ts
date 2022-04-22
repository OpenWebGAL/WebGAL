import {scriptExecutor} from "@/Core/controller/gamePlay/scriptExecutor";

export const bindExtraFunc = () => {
    (window as any).jmpToSentence = scriptExecutor;
};
