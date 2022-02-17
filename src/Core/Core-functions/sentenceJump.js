import logger from "../util/logger";
import {getRuntime, SyncCurrentStatus} from "../StoreControl/StoreControl";
import {increaseSentence, nextSentenceProcessor} from "../WG_core";

function ifJump(command, content) {
    let judgeBody = command.split(')')[0].split('(')[1];
    let jumpActivated = false;
    if (judgeBody.split('<=')[1]) {
        logger.debug("case <=")
        if (getRuntime().currentInfo.GameVar[judgeBody.split('<=')[0]] <= parseInt(judgeBody.split('<=')[1])) {
            logger.debug("jump to" + content);
            jumpSentence(content);
            jumpActivated = true;
        }
    } else if (judgeBody.split('>=')[1]) {
        logger.debug("case >=")
        if (getRuntime().currentInfo.GameVar[judgeBody.split('>=')[0]] >= parseInt(judgeBody.split('>=')[1])) {
            logger.debug("jump to" + content);
            jumpSentence(content);
            jumpActivated = true;
        }
    } else if (judgeBody.split('<')[1]) {
        logger.debug("case <")
        if (getRuntime().currentInfo.GameVar[judgeBody.split('<')[0]] < parseInt(judgeBody.split('<')[1])) {
            logger.debug("jump to" + content);
            jumpSentence(content);
            jumpActivated = true;
        }
    } else if (judgeBody.split('>')[1]) {
        logger.debug("case >")
        if (getRuntime().currentInfo.GameVar[judgeBody.split('>')[0]] > parseInt(judgeBody.split('>')[1])) {
            logger.debug("jump to" + content);
            jumpSentence(content);
            jumpActivated = true;
        }
    } else if (judgeBody.split('=')[1]) {
        logger.debug("case = ")
        if (getRuntime().currentInfo.GameVar[judgeBody.split('=')[0]] === parseInt(judgeBody.split('=')[1])) {
            logger.debug("jump to" + content);
            jumpSentence(content);
            jumpActivated = true;
        }
    }
    if (!jumpActivated) {
        increaseSentence();
        nextSentenceProcessor();
    }
}

function jumpSentence(lab_name) {
    //find the line of the label:
    // noinspection DuplicatedCode
    let find = false;
    let jmp_sentence = 0;
    for (let i = 0; i < getRuntime().currentScene.length; i++) {
        if (getRuntime().currentScene[i][0] === 'label' && getRuntime().currentScene[i][1] === lab_name) {
            find = true;
            jmp_sentence = i;
        }
    }
    if (find) {
        SyncCurrentStatus("SentenceID", jmp_sentence);
        nextSentenceProcessor();

    } else {
        increaseSentence();
        nextSentenceProcessor();

    }
}

export {jumpSentence, ifJump}