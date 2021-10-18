// 读取下一条脚本
function nextSentenceProcessor() {

    if(showingText){
        showingText = false;
        return;
    }//检测目前是否正在进行文字渐显，如果渐显，则终止渐显，直接读完文本
    let saveBacklogNow = false;//该变量决定此条语句是否需要加入到backlog
    if(getStatus('SentenceID') >= currentScene.length){
        return;
    }//如果超过场景文本行数，停止处理语句。
    let thisSentence = currentScene[getStatus('SentenceID')];//此条语句的内容
    let command = thisSentence[0];//此条语句的控制文本（也可能是省略人物对话的语句）
    let S_content = thisSentence[1]
    if (command === 'changeBG') {
        VC_changeBG(S_content);//界面控制：换背景
        SyncCurrentStatus("bg_Name",S_content);//同步当前状态
        autoPlay('on');//在非next语句下调用autoplay
    }//改背景
    else if(command === 'changeP'){
        VC_changeP(S_content,'center');
        SyncCurrentStatus('fig_Name',S_content);
        autoPlay('on');
    }//改立绘
    else if(command === 'changeP_left'){
        VC_changeP(S_content,'left');
        SyncCurrentStatus('fig_Name_left',S_content);
        autoPlay('on');
    }
    else if(command === 'changeP_right'){
        VC_changeP(S_content,'right');
        SyncCurrentStatus('fig_Name_right',S_content);
        autoPlay('on');
    }
    else if(command === 'changeP_next'){
        VC_changeP(S_content,'center');
        SyncCurrentStatus('fig_Name',S_content);
        increaseSentence();
        nextSentenceProcessor();
        return;
    }
    else if(command === 'changeP_left_next'){
        VC_changeP(S_content,'left');
        SyncCurrentStatus('fig_Name_left',S_content);
        increaseSentence();
        nextSentenceProcessor();
        return;
    }
    else if(command === 'changeP_right_next'){
        VC_changeP(S_content,'right')
        SyncCurrentStatus('fig_Name_right',S_content);
        increaseSentence();
        nextSentenceProcessor();
        return;
    }
    else if(command === 'changeBG_next'){
        VC_changeBG(S_content);
        increaseSentence();
        SyncCurrentStatus("bg_Name",S_content);
        nextSentenceProcessor();
        return;
    }
    else if(command === 'changeScene'){
        let sUrl = "game/scene/"+thisSentence[1];
        let SceneName =  thisSentence[1];
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
        VC_choose(selection,'scene');
        return;
    }
    else if(command === 'bgm'){
        currentInfo["bgm"] = thisSentence[1];
        loadBGM();
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
        VC_choose(selection,'label')
        return;
    }
    else if(command === 'jump_label'){
        let lab_name = thisSentence[1];
        //find the line of the label:
        let find = false;
        let jmp_sentence = 0;
        for (let i = 0; i < currentScene.length; i++) {
            if(currentScene[i][0] === 'label' && currentScene[i][1] === lab_name){
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
        showIntro(introText);
        return;
    }
    else {
        SyncCurrentStatus('command',processSentence(getStatus("SentenceID"))['name']);
        SyncCurrentStatus('showName',processSentence(getStatus("SentenceID"))['name']);
        SyncCurrentStatus('showText',processSentence(getStatus("SentenceID"))['text']);
        SyncCurrentStatus('vocal',processSentence(getStatus("SentenceID"))['vocal']);
        VC_textShow(getStatus('showName'),getStatus('showText'));
        if(currentInfo["vocal"]!== ''){
            playVocal();
        }
        saveBacklogNow = true;
    }
    increaseSentence();
    if(saveBacklogNow){
        if(CurrentBacklog.length<=500){
            let temp = JSON.stringify(currentInfo);
            let pushElement = JSON.parse(temp);
            CurrentBacklog[CurrentBacklog.length] = JSON.parse(temp);
        }else{
            CurrentBacklog.shift();
            let temp = JSON.stringify(currentInfo);
            CurrentBacklog[CurrentBacklog.length] = JSON.parse(temp);
        }
    }

    function autoPlay(active){
        if(auto === 1 && active === 'on'){
            let interval = setInterval(jumpNext,autoWaitTime);
            function jumpNext(){
                if(auto === 1)
                    nextSentenceProcessor();
                clearInterval(interval);
            }

        }
    }
}

//sentenceID+1
function increaseSentence(){
    SyncCurrentStatus('SentenceID',getStatus('SentenceID')+1);
}



