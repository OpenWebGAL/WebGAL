var currentScene ='';
var currentSceneIndex = 0;
var currentSentence = 0;
function getScene() {
    let getScReq = null;
    getScReq = new XMLHttpRequest();

    if (getScReq != null) {
        getScReq.open("get", "game/scene/start.sce", true);
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
        document.getElementById('mainBackground').style.backgroundImage = "url('/game/background/" + thisSentence[1] + "')";
    }
    else if(command === 'changeP'){
        if (thisSentence[1] === 'none'){
            ReactDOM.render(<div/>,document.getElementById('figureImage'));
        }else{
            let pUrl = "/game/figure/"+thisSentence[1];
            let changedP = <img src={pUrl} alt='figure' className='p_center'/>
            // console.log('now changing person');
            ReactDOM.render(changedP,document.getElementById('figureImage'));
        }

    }
    else if(command === 'changeP_next'){
        if (thisSentence[1] === 'none'){
            ReactDOM.render(<div/>,document.getElementById('figureImage'));
        }else{
            let pUrl = "/game/figure/"+thisSentence[1];
            let changedP = <img src={pUrl} alt='figure' className='p_center'/>
            // console.log('now changing person');
            ReactDOM.render(changedP,document.getElementById('figureImage'));
        }
        currentSentence = currentSentence+1;
        nextSentenceProcessor();
        return;
    }
    else if(command === 'changeBG_next'){
        document.getElementById('mainBackground').style.backgroundImage = "url('/game/background/" + thisSentence[1] + "')";
        currentSentence = currentSentence+1;
        nextSentenceProcessor();
        return;
    }
    else {
        let changedName = <span>{processSentence(currentSentence)['name']}</span>
        let changedText = <p>{processSentence(currentSentence)['text']}</p>
        ReactDOM.render(changedName, document.getElementById('pName'));
        ReactDOM.render(changedText, document.getElementById('SceneText'));
    }
    currentSentence = currentSentence+1;
}