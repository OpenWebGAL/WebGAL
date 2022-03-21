import {scriptExecutor} from "./scriptExecutor";

export const nextSentence = () => {
    //检查是否存在blockNext 的演出
    const isBlockingNext = false;
    if (isBlockingNext) {
        return;
    } else {
        scriptExecutor();
    }
}