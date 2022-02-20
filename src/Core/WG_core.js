/**
 * @author MakinoharaShoko
 * @file WebGAL核心函数，用于读取脚本并推进游戏进程
 */


import {getRuntime, getStatus, SyncCurrentStatus} from "./StoreControl/StoreControl"
import logger from "./util/logger";
import scriptMap from "./Core-functions/scriptMap";
import runScript from "./Core-functions/runScript";
import {varProcess} from "./Core-functions/varProcess";
import {ifJump} from "./Core-functions/sentenceJump";
import pushSentenceToBacklog from "./Core-functions/pushSentenceToBacklog";

/**
 * 读取下一条脚本
 */
function nextSentenceProcessor() {
    if (getRuntime().showingText) {
        getRuntime().showingText = false;
        return;
    }//检测目前是否正在进行文字渐显，如果渐显，则终止渐显，直接读完文本
    if (getStatus('SentenceID') >= getRuntime().currentScene.length) {
        return;
    }//如果超过场景文本行数，停止处理语句。
    let thisSentence = getRuntime().currentScene[getStatus('SentenceID')];//此条语句的内容
    let command = thisSentence[0];//此条语句的控制文本（也可能是省略人物对话的语句）
    let S_content = thisSentence[1];
    let pushToBacklog = false;
    logger.info('读取脚本', thisSentence);

    //特殊语句
    if (command.substring(0, 3) === "var" || command.substring(0, 8) === "jump_var") {
        varProcess(command, S_content);
        return;
    }
    if (command.substring(0, 2) === 'if') {
        ifJump(command, S_content);
        return;
    }

    const scriptType = scriptMap(command);
    const runResult = runScript(scriptType,S_content);
    if(runResult){
        if(runResult.hasOwnProperty('autoPlay')&& runResult.autoPlay){
            autoPlay('on');
        }
        if(runResult.hasOwnProperty('ret')&&runResult.ret){
            return;
        }
        if(runResult.hasOwnProperty('toBacklog')&&runResult.toBacklog){
            pushToBacklog = true;
        }
    }
    increaseSentence();
    if(pushToBacklog){
        pushSentenceToBacklog();
    }
    function autoPlay(active) {
        if (getRuntime().auto === 1 && active === 'on') {
            setTimeout(jumpNext, getRuntime().autoWaitTime);
            function jumpNext() {
                if (getRuntime().auto === 1) nextSentenceProcessor();
            }
        }
    }
}

//sentenceID+1
function increaseSentence() {
    SyncCurrentStatus('SentenceID', getStatus('SentenceID') + 1);
}

export {nextSentenceProcessor, increaseSentence}
