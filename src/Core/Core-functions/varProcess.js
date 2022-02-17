import {getRuntime} from "../StoreControl/StoreControl";
import {increaseSentence, nextSentenceProcessor} from "../WG_core";
import logger from "../util/logger";
import {jumpSentence} from "./sentenceJump";

function varProcess(command, content) {
    if (command === 'varSet') {
        content = content.split(';')[0];
        content = content.split(',');
        for (let i = 0; i < content.length; i++) {
            let singleSet = content[i];
            singleSet = singleSet.split(':');
            getRuntime().currentInfo.GameVar[singleSet[0]] = parseInt(singleSet[1]);
        }
    } else if (command === 'varUp') {
        content = content.split(';')[0];
        content = content.split(',');
        for (let i = 0; i < content.length; i++) {
            let singleSet = content[i];
            singleSet = singleSet.split(':');
            getRuntime().currentInfo.GameVar[singleSet[0]] = getRuntime().currentInfo.GameVar[singleSet[0]] + parseInt(singleSet[1]);
        }
    } else if (command === 'varDrop') {
        content = content.split(';')[0];
        content = content.split(',');
        for (let i = 0; i < content.length; i++) {
            let singleSet = content[i];
            singleSet = singleSet.split(':');
            getRuntime().currentInfo.GameVar[singleSet[0]] = getRuntime().currentInfo.GameVar[singleSet[0]] - parseInt(singleSet[1]);
        }
    } else if (command === 'jump_varReach') {
        content = content.split(';')[0];
        content = content.split(',');
        let varArea = content[0];
        varArea = varArea.split(':');
        let JumpArea = content[1];
        if (getRuntime().currentInfo.GameVar[varArea[0]] >= parseInt(varArea[1])) {
            //find the line of the label:
            jumpSentence(JumpArea);
            return;
        }
    } else if (command === 'jump_varBelow') {
        content = content.split(';')[0];
        content = content.split(',');
        let varArea = content[0];
        varArea = varArea.split(':');
        let JumpArea = content[1];
        if (getRuntime().currentInfo.GameVar[varArea[0]] < parseInt(varArea[1])) {
            //find the line of the label:
            jumpSentence(JumpArea);
            return;
        }
    }
    increaseSentence();
    nextSentenceProcessor();
}

function setVar(content) {
    let setList = content.split(',');
    for (let i = 0; i < setList.length; i++) {
        let setSent = setList[i];
        setSent = setSent.split('=');
        let setVarName = setSent[0];
        let setVarValue = setSent[1];
        if (setVarValue.split('+')[1]) {
            logger.debug("case +")
            let valueLeft = getRuntime().currentInfo.GameVar[setVarValue.split('+')[0]];
            let valueRight = parseInt(setVarValue.split('+')[1]);
            getRuntime().currentInfo.GameVar[setVarName] = valueLeft + valueRight;
        } else if (setVarValue.split('-')[1]) {
            logger.debug("case -")
            let valueLeft = getRuntime().currentInfo.GameVar[setVarValue.split('-')[0]];
            let valueRight = parseInt(setVarValue.split('-')[1]);
            getRuntime().currentInfo.GameVar[setVarName] = valueLeft - valueRight;
        } else if (setVarValue.split('*')[1]) {
            logger.debug("case *")
            let valueLeft = getRuntime().currentInfo.GameVar[setVarValue.split('*')[0]];
            let valueRight = parseInt(setVarValue.split('*')[1]);
            getRuntime().currentInfo.GameVar[setVarName] = valueLeft * valueRight;
        } else if (setVarValue.split('/')[1]) {
            logger.debug("case /")
            let valueLeft = getRuntime().currentInfo.GameVar[setVarValue.split('/')[0]];
            let valueRight = parseInt(setVarValue.split('/')[1]);
            getRuntime().currentInfo.GameVar[setVarName] = valueLeft / valueRight;
        } else {
            logger.debug("case value")
            getRuntime().currentInfo.GameVar[setVarName] = parseInt(setVarValue);
        }
    }
}

export {setVar, varProcess};