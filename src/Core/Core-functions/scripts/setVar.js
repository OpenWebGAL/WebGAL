import {increaseSentence, nextSentenceProcessor} from "../../WG_core";
import {setVarFunc} from "../varProcess";

const setVar=(S_content)=>{
    setVarFunc(S_content)
    increaseSentence();
    nextSentenceProcessor();
    return {'ret': true, 'autoPlay': false};
}

export default setVar;