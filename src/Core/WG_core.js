import {
    getRuntime,
    getScene,
    getStatus,
    SyncCurrentStatus
} from "./StoreControl/StoreControl"
import {WG_ViewControl} from "./ViewController/ViewControl";
import {processSentence} from "./util/WG_util";

// 读取下一条脚本
function nextSentenceProcessor() {

    if(getRuntime().showingText){
        getRuntime().showingText = false;
        return;
    }//检测目前是否正在进行文字渐显，如果渐显，则终止渐显，直接读完文本
    let saveBacklogNow = false;//该变量决定此条语句是否需要加入到backlog
    if(getStatus('SentenceID') >= getRuntime().currentScene.length){
        return;
    }//如果超过场景文本行数，停止处理语句。
    let thisSentence = getRuntime().currentScene[getStatus('SentenceID')];//此条语句的内容
    let command = thisSentence[0];//此条语句的控制文本（也可能是省略人物对话的语句）
    let S_content = thisSentence[1];
    console.log("------now running NSP------"+thisSentence);
    if (command === 'changeBG') {
        WG_ViewControl.VC_changeBG(S_content);//界面控制：换背景
        SyncCurrentStatus("bg_Name",S_content);//同步当前状态
        autoPlay('on');//在非next语句下调用autoplay
    }//改背景
    else if(command === 'changeP'){
        WG_ViewControl.VC_changeP(S_content,'center');
        SyncCurrentStatus('fig_Name',S_content);
        autoPlay('on');
    }//改立绘
    else if(command === 'changeP_left'){
        WG_ViewControl.VC_changeP(S_content,'left');
        SyncCurrentStatus('fig_Name_left',S_content);
        autoPlay('on');
    }
    else if(command === 'changeP_right'){
        WG_ViewControl.VC_changeP(S_content,'right');
        SyncCurrentStatus('fig_Name_right',S_content);
        autoPlay('on');
    }
    else if(command === 'changeP_next'){
        WG_ViewControl.VC_changeP(S_content,'center');
        SyncCurrentStatus('fig_Name',S_content);
        increaseSentence();
        nextSentenceProcessor();
        return;
    }
    else if(command === 'changeP_left_next'){
        WG_ViewControl.VC_changeP(S_content,'left');
        SyncCurrentStatus('fig_Name_left',S_content);
        increaseSentence();
        nextSentenceProcessor();
        return;
    }
    else if(command === 'changeP_right_next'){
        WG_ViewControl.VC_changeP(S_content,'right')
        SyncCurrentStatus('fig_Name_right',S_content);
        increaseSentence();
        nextSentenceProcessor();
        return;
    }
    else if(command === 'changeBG_next'){
        WG_ViewControl.VC_changeBG(S_content);
        increaseSentence();
        SyncCurrentStatus("bg_Name",S_content);
        nextSentenceProcessor();
        return;
    }
    else if(command === 'changeScene'){
        let sUrl = "game/scene/"+thisSentence[1];
        getScene(sUrl);
        SyncCurrentStatus('SceneName',S_content);
        return;
    }
    else if(command === 'choose'){
        SyncCurrentStatus('command',command);
        SyncCurrentStatus('choose',S_content);
        let chooseItems =S_content;
        chooseItems = chooseItems.split("}")[0];
        chooseItems = chooseItems.split("{")[1];
        let selection = chooseItems.split(',')
        for (let i = 0;i<selection.length;i++){
            selection[i] = selection[i].split(":");
        }
        WG_ViewControl.VC_choose(selection,'scene');
        return;
    }
    else if(command === 'bgm'){
        SyncCurrentStatus('bgm',S_content);
        // getRuntime().currentInfo["bgm"] =  S_content;
        WG_ViewControl.loadBGM();
        increaseSentence();
        nextSentenceProcessor();
        return;
    }
    else if(command === 'choose_label'){
        SyncCurrentStatus('command',command);
        SyncCurrentStatus('choose',S_content);
        let chooseItems =S_content;
        chooseItems = chooseItems.split("}")[0];
        chooseItems = chooseItems.split("{")[1];
        let selection = chooseItems.split(',')
        for (let i = 0;i<selection.length;i++){
            selection[i] = selection[i].split(":");
        }
        WG_ViewControl.VC_choose(selection,'label')
        return;
    }
    else if(command === 'jump_label'){
        let lab_name = thisSentence[1];
        //find the line of the label:
        let find = false;
        let jmp_sentence = 0;
        for (let i = 0; i < getRuntime().currentScene.length; i++) {
            if(getRuntime().currentScene[i][0] === 'label' && getRuntime().currentScene[i][1] === lab_name){
                find = true;
                jmp_sentence = i;
            }
        }
        if(find){
            SyncCurrentStatus("SentenceID",jmp_sentence);
            nextSentenceProcessor();
            return;
        }else
        {
            increaseSentence();
            nextSentenceProcessor();
            return;
        }
    }
    else if(command === 'label'){
        increaseSentence();
        nextSentenceProcessor();
        return;
    }
    else if(command === 'intro'){
        let introText = thisSentence[1];
        WG_ViewControl.showIntro(introText);
        return;
    }
    else if(command === 'miniAvatar'){
        WG_ViewControl.VC_showMiniAvatar(S_content);
        SyncCurrentStatus('miniAvatar',S_content);
        increaseSentence();
        nextSentenceProcessor();
        return;
    }
    else if(command.substr(0,3) === "var" || command.substr(0,8) === "jump_var"){
        varProcess(command,S_content);
        return;
    }else if(command === 'showVar'){
        console.log("showing var");
        SyncCurrentStatus('command', command);
        SyncCurrentStatus('showName',command);
        SyncCurrentStatus('showText',JSON.stringify(getRuntime().currentInfo.GameVar));
        WG_ViewControl.VC_textShow(getStatus('showName'),getStatus('showText'));
        saveBacklogNow = true;
    }else if(command.substr(0,2) === 'if'){
        ifJump(command,S_content);
        return;
    }else if(command === 'setVar'){
        setVar(S_content)
        increaseSentence();
        nextSentenceProcessor();
        return;
    }
    else {
        SyncCurrentStatus('command',processSentence(getStatus("SentenceID"))['name']);
        SyncCurrentStatus('showName',processSentence(getStatus("SentenceID"))['name']);
        SyncCurrentStatus('showText',processSentence(getStatus("SentenceID"))['text']);
        SyncCurrentStatus('vocal',processSentence(getStatus("SentenceID"))['vocal']);
        WG_ViewControl.VC_textShow(getStatus('showName'),getStatus('showText'));
        if(getStatus("all")["vocal"]!== ''){
            WG_ViewControl.playVocal();
        }
        saveBacklogNow = true;
    }
    increaseSentence();
    if(saveBacklogNow){
        if(getRuntime().CurrentBacklog.length<=500){
            let temp = JSON.stringify(getStatus("all"));
            getRuntime().CurrentBacklog[getRuntime().CurrentBacklog.length] = JSON.parse(temp);
        }else{
            getRuntime().CurrentBacklog.shift();
            let temp = JSON.stringify(getStatus("all"));
            getRuntime().CurrentBacklog[getRuntime().CurrentBacklog.length] = JSON.parse(temp);
        }
    }

    function autoPlay(active){
        if(getRuntime().auto === 1 && active === 'on'){
            setTimeout(jumpNext,getRuntime().autoWaitTime);
            function jumpNext(){
                if(getRuntime().auto === 1)
                    nextSentenceProcessor();
            }

        }
    }
}

//sentenceID+1
function increaseSentence(){
    SyncCurrentStatus('SentenceID',getStatus('SentenceID')+1);
}

function varProcess(command,content){
    if(command === 'varSet'){
        content = content.split(';')[0];
        console.log(content);
        content = content.split(',');
        console.log(content)
        for (let i = 0; i < content.length; i++) {
            let singleSet = content[i];
            singleSet = singleSet.split(':');
            console.log(singleSet)
            getRuntime().currentInfo.GameVar[singleSet[0]] = parseInt(singleSet[1]);
        }
    }else if(command === 'varUp'){
        content = content.split(';')[0];
        console.log(content);
        content = content.split(',');
        for (let i = 0; i < content.length; i++) {
            let singleSet = content[i];
            singleSet = singleSet.split(':');
            getRuntime().currentInfo.GameVar[singleSet[0]] = getRuntime().currentInfo.GameVar[singleSet[0]]+parseInt(singleSet[1]);
        }
    }else if(command === 'varDrop'){
        content = content.split(';')[0];
        console.log(content);
        content = content.split(',');
        for (let i = 0; i < content.length; i++) {
            let singleSet = content[i];
            singleSet = singleSet.split(':');
            getRuntime().currentInfo.GameVar[singleSet[0]] = getRuntime().currentInfo.GameVar[singleSet[0]]-parseInt(singleSet[1]);
        }
    }else if(command === 'jump_varReach'){
        content = content.split(';')[0];
        console.log(content);
        content = content.split(',');
        let varArea = content[0];
        varArea = varArea.split(':');
        let JumpArea = content[1];
        console.log("var data is"+parseInt(varArea[1])+getRuntime().currentInfo.GameVar[varArea[0]])
        if(getRuntime().currentInfo.GameVar[varArea[0]]>=parseInt(varArea[1])){
            let lab_name = JumpArea;
            //find the line of the label:
            let find = false;
            let jmp_sentence = 0;
            for (let i = 0; i < getRuntime().currentScene.length; i++) {
                if(getRuntime().currentScene[i][0] === 'label' && getRuntime().currentScene[i][1] === lab_name){
                    find = true;
                    jmp_sentence = i;
                }
            }
            if(find){
                SyncCurrentStatus("SentenceID",jmp_sentence);
                nextSentenceProcessor();
                return;
            }else
            {
                increaseSentence();
                nextSentenceProcessor();
                return;
            }
        }
    }else if(command === 'jump_varBelow'){
        content = content.split(';')[0];
        console.log(content);
        content = content.split(',');
        let varArea = content[0];
        varArea = varArea.split(':');
        let JumpArea = content[1];
        if(getRuntime().currentInfo.GameVar[varArea[0]]<parseInt(varArea[1])){
            let lab_name = JumpArea;
            //find the line of the label:
            let find = false;
            let jmp_sentence = 0;
            for (let i = 0; i < getRuntime().currentScene.length; i++) {
                if(getRuntime().currentScene[i][0] === 'label' && getRuntime().currentScene[i][1] === lab_name){
                    find = true;
                    jmp_sentence = i;
                }
            }
            if(find){
                SyncCurrentStatus("SentenceID",jmp_sentence);
                nextSentenceProcessor();
                return;
            }else
            {
                increaseSentence();
                nextSentenceProcessor();
                return;
            }
        }
    }
    console.log(getRuntime().currentInfo.GameVar);
    increaseSentence();
    nextSentenceProcessor();
}

function ifJump(command,content){
    let judgeBody=command.split(')')[0].split('(')[1];
    console.log("judgeBody is: ");
    console.log(judgeBody);
    console.log(judgeBody.split('<=')[1]);
    let jumpActivated = false;
    if(judgeBody.split('<=')[1]){
        console.log("case <=")
        if(getRuntime().currentInfo.GameVar[judgeBody.split('<=')[0]] <= parseInt(judgeBody.split('<=')[1])){
            console.log("jump to"+content);
            jumpSentence(content);
            jumpActivated = true;
        }
    }else if(judgeBody.split('>=')[1]){
        console.log("case >=")
        if(getRuntime().currentInfo.GameVar[judgeBody.split('>=')[0]] >= parseInt(judgeBody.split('>=')[1])){
            console.log("jump to"+content);
            jumpSentence(content);
            jumpActivated = true;
        }
    }else if(judgeBody.split('<')[1]){
        console.log("case <")
        if(getRuntime().currentInfo.GameVar[judgeBody.split('<')[0]] < parseInt(judgeBody.split('<')[1])){
            console.log("jump to"+content);
            jumpSentence(content);
            jumpActivated = true;
        }
    }else if(judgeBody.split('>')[1]){
        console.log("case >")
        if(getRuntime().currentInfo.GameVar[judgeBody.split('>')[0]] > parseInt(judgeBody.split('>')[1])){
            console.log("jump to"+content);
            jumpSentence(content);
            jumpActivated = true;
        }
    }else if(judgeBody.split('=')[1]){
        console.log("case = ")
        if(getRuntime().currentInfo.GameVar[judgeBody.split('=')[0]] === parseInt(judgeBody.split('=')[1])){
            console.log("jump to"+content);
            jumpSentence(content);
            jumpActivated = true;
        }
    }
    if(!jumpActivated){
        increaseSentence();
        nextSentenceProcessor();
    }
}
function jumpSentence(lab_name){
    //find the line of the label:
    let find = false;
    let jmp_sentence = 0;
    for (let i = 0; i < getRuntime().currentScene.length; i++) {
        if(getRuntime().currentScene[i][0] === 'label' && getRuntime().currentScene[i][1] === lab_name){
            find = true;
            jmp_sentence = i;
        }
    }
    if(find){
        SyncCurrentStatus("SentenceID",jmp_sentence);
        nextSentenceProcessor();

    }else
    {
        increaseSentence();
        nextSentenceProcessor();

    }
}

function setVar(content) {
    let setList = content.split(',');
    for (let i = 0; i < setList.length; i++) {
        let setSent = setList[i];
        setSent = setSent.split('=');
        let setVarName = setSent[0];
        let setVarValue = setSent[1];
        if(setVarValue.split('+')[1]){
            console.log("case +")
            let valueLeft = getRuntime().currentInfo.GameVar[setVarValue.split('+')[0]];
            let valueRight = parseInt(setVarValue.split('+')[1]);
            getRuntime().currentInfo.GameVar[setVarName] = valueLeft+valueRight;
        }
        else if(setVarValue.split('-')[1]){
            console.log("case -")
            let valueLeft = getRuntime().currentInfo.GameVar[setVarValue.split('-')[0]];
            let valueRight = parseInt(setVarValue.split('-')[1]);
            getRuntime().currentInfo.GameVar[setVarName] = valueLeft-valueRight;
        }
        else if(setVarValue.split('*')[1]){
            console.log("case *")
            let valueLeft = getRuntime().currentInfo.GameVar[setVarValue.split('*')[0]];
            let valueRight = parseInt(setVarValue.split('*')[1]);
            getRuntime().currentInfo.GameVar[setVarName] = valueLeft*valueRight;
        }
        else if(setVarValue.split('/')[1]){
            console.log("case /")
            let valueLeft = getRuntime().currentInfo.GameVar[setVarValue.split('/')[0]];
            let valueRight = parseInt(setVarValue.split('/')[1]);
            getRuntime().currentInfo.GameVar[setVarName] = valueLeft/valueRight;
        }else {
            console.log("case value")
            getRuntime().currentInfo.GameVar[setVarName] = parseInt(setVarValue);
        }
    }
    console.log(getRuntime().currentInfo.GameVar);
}

export {nextSentenceProcessor,increaseSentence}
