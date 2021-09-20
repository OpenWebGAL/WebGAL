var currentScene ='';
var currentSceneIndex = 0;
var currentSentence = 0;
var currentText = 0;
function getScene() {
    let getScReq = null;
    getScReq = new XMLHttpRequest();

    if (getScReq != null) {
        getScReq.open("get", "game/scene/start.txt", true);
        getScReq.send();
        getScReq.onreadystatechange = doResult; //设置回调函数
    }
    function doResult() {
        if (getScReq.readyState === 4) { //4表示执行完成
            if (getScReq.status === 200) { //200表示执行成功
                currentScene = getScReq.responseText;
                currentScene = currentScene.split('\n');
                for (let i = 0;i<currentScene.length;i++){
                    currentScene[i] = currentScene[i].split(";")[0];
                    currentScene[i] = currentScene[i].split(":");
                }
                console.log('Read scene complete.');
                // console.log(currentScene);
                nextSentenceProcessor();
            }
        }
    }

}

window.onload = function (){
    getScene();
}

function processSentence(i){
    if(i<currentScene.length)
        return {name:currentScene[i][0],text:currentScene[i][1]};
}

function nextSentenceProcessor() {
    if(currentSentence >= currentScene.length){
        return;
    }
    let thisSentence = currentScene[currentSentence];
    let command = thisSentence[0];
    console.log(command)
    if (command === 'changeBG') {
        // console.log('Now change background to ' + "url('/game/background/" + thisSentence[1] + "')");
        document.getElementById('mainBackground').style.backgroundImage = "url('game/background/" + thisSentence[1] + "')";
    }
    else if(command === 'changeP'){
        if (thisSentence[1] === 'none'){
            ReactDOM.render(<div/>,document.getElementById('figureImage'));
        }else{
            let pUrl = "game/figure/"+thisSentence[1];
            let changedP = <img src={pUrl} alt='figure' className='p_center'/>
            // console.log('now changing person');
            ReactDOM.render(changedP,document.getElementById('figureImage'));
        }

    }
    else if(command === 'changeP_next'){
        if (thisSentence[1] === 'none'){
            ReactDOM.render(<div/>,document.getElementById('figureImage'));
        }else{
            let pUrl = "game/figure/"+thisSentence[1];
            let changedP = <img src={pUrl} alt='figure' className='p_center'/>
            // console.log('now changing person');
            ReactDOM.render(changedP,document.getElementById('figureImage'));
        }
        currentSentence = currentSentence+1;
        nextSentenceProcessor();
        return;
    }
    else if(command === 'changeBG_next'){
        document.getElementById('mainBackground').style.backgroundImage = "url('game/background/" + thisSentence[1] + "')";
        currentSentence = currentSentence+1;
        nextSentenceProcessor();
        return;
    }
    else {
        let changedName = <span>{processSentence(currentSentence)['name']}</span>
        let textArray = processSentence(currentSentence)['text'].split("");
        // let changedText = <p>{processSentence(currentSentence)['text']}</p>
        ReactDOM.render(changedName, document.getElementById('pName'));
        showTextArray(textArray,currentText+1);
        currentText = currentText + 1;
    }
    currentSentence = currentSentence+1;
}

function showTextArray(textArray,now){
    ReactDOM.render(<span> </span>, document.getElementById('SceneText'));
    let elementArray = [];
    let i = 0;
    clearInterval(interval);
    var interval = setInterval(showSingle,60);
    function showSingle() {
        let tempElement = <span key={i} className='singleWord'>{textArray[i]}</span>
        elementArray.push(tempElement);
        if(currentText === now)
            ReactDOM.render(<div>{elementArray}</div>, document.getElementById('SceneText'));
        i = i+1;
        if(i > textArray.length && currentText!== now){
            clearInterval(interval);
        }
    }
}

function onSetting(){
    let settingInterface = <div>
        <div className="singleSettingItem">
            <span className="settingItemTitle">字体大小</span>
        </div>
        <div className="singleSettingItem">
            <span className="settingItemTitle">文字显示速度</span>
        </div>
        <div className="singleSettingItem">
            <span className="settingItemTitle">音量调节</span>
        </div>
        <div className="singleSettingItem">
            <span className="settingItemTitle">中断语音设置</span>
        </div>
        <div className="singleSettingItem">
            <span className="settingItemTitle">字体选择</span>
        </div>
    </div>
    document.getElementById("settings").style.display = "flex"
    document.getElementById("bottomBox").style.display = "none"
    ReactDOM.render(settingInterface,document.getElementById("settingItems"))
}

function closeSettings(){
    document.getElementById("settings").style.display = "none"
    document.getElementById("bottomBox").style.display = "flex"
}