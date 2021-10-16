//引擎加载完成
window.onload = function () {
    loadCookie();
    loadSettings();
    document.getElementById('Title').style.backgroundImage = 'url("./game/background/Title.png")';
    if(isMobile()){
        MobileChangeStyle();
    }
}

// 保存当前游戏状态
function saveGame(index){
    let tempInfo = JSON.stringify(currentInfo);
    Saves[index] = JSON.parse(tempInfo);
    let tempBacklog = JSON.stringify(CurrentBacklog);
    SaveBacklog[index]= JSON.parse(tempBacklog);
    writeCookie();
}

// 获取场景脚本
function getScene(url) {
    currentScene ='';

    let getScReq = null;
    getScReq = new XMLHttpRequest();
    console.log('now read scene')
    if (getScReq != null) {
        getScReq.open("get",url , true);
        getScReq.send();
        getScReq.onreadystatechange = doResult; //设置回调函数
    }
    function doResult() {
        if (getScReq.readyState === 4) { //4表示执行完成
            if (getScReq.status === 200) { //200表示执行成功
                currentScene = getScReq.responseText;
                currentScene = currentScene.split('\n');
                for (let i = 0;i<currentScene.length;i++){
                    let tempSentence = currentScene[i].split(";")[0];
                    let commandLength = tempSentence.split(":")[0].length;
                    let command = currentScene[i].split(":")[0];
                    command = command.split(';')[0];
                    let content = tempSentence.slice(commandLength+1);
                    currentScene[i] = currentScene[i].split(":");
                    currentScene[i][0] = command;
                    currentScene[i][1] = content;
                }
                // console.log('Read scene complete.');
                // console.log(currentScene);
                SyncCurrentStatus('SentenceID',0);
                nextSentenceProcessor();
            }
        }
    }

}

// 处理脚本
function processSentence(i){
    if(i<currentScene.length)
    {
        let vocal = '';
        if(currentScene[i][1] !== '')
        {
            let text = currentScene[i][1];
            if(currentScene[i][1].split('vocal-').length > 1)
            {
                vocal = currentScene[i][1].split('vocal-')[1].split(',')[0];
                text = currentScene[i][1].split('vocal-')[1].slice(currentScene[i][1].split('vocal-')[1].split(',')[0].length+1);
            }
            SyncCurrentStatus("showName",currentScene[i][0]);
            return {name:getStatus('showName'),text:text,vocal:vocal};
        }
        else
        {
            let text = currentScene[i][0];
            if(currentScene[i][0].split('vocal-').length > 1){
                vocal = currentScene[i][0].split('vocal-')[1].split(',')[0];
                text = currentScene[i][0].split('vocal-')[1].slice(currentScene[i][0].split('vocal-')[1].split(',')[0].length+1);
            }
            return {name:getStatus('showName'),text:text,vocal:vocal};
        }


    }

}

//通过label跳分支
function chooseJumpFun(label){
    let lab_name = label;
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
        SyncCurrentStatus('SentenceID',jmp_sentence);
        nextSentenceProcessor();
        document.getElementById("chooseBox").style.display="none"
    }else
    {
        increaseSentence();
        nextSentenceProcessor();
        document.getElementById("chooseBox").style.display="none"
    }
}

function clickOnBack(){
    if(hideTextStatus){
        document.getElementById('bottomBox').style.display = 'flex';
        hideTextStatus = false;
    }else {
        nextSentenceProcessor();
    }
}



