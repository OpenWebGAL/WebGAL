import {jumpSentence} from "../sentenceJump";

const jump_label=(S_content)=>{
    //find the line of the label:
    jumpSentence(S_content);
    return {'ret': true, 'autoPlay': false};
}

export default jump_label;