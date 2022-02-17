//这里是每一种script对应的动作
import changeBG from "./scripts/changeBG";

const scriptToFunction = {
    'changeBG': changeBG,
}

const runScript = (scriptType, S_content) => {
    let runFunc = scriptToFunction[scriptType];
    return runFunc(S_content);
}

export default runScript;