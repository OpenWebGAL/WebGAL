import {increaseSentence, nextSentenceProcessor} from "../../WG_core";

const label=(S_content)=>{
    increaseSentence();
    nextSentenceProcessor();
    return {'ret': true, 'autoPlay': false};
}
export default label;