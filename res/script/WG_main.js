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
                    currentScene[i] = currentScene[i].split(":");
                }
                console.log('Read scene complete.');
                console.log(currentScene);
            }
        }
    }
}

window.onload = function (){
    getScene();
}

function processSentence(i){
    if(i<currentScene.length)
        return currentScene[i][0]+": "+currentScene[i][1];
}

function nextSentenceProcessor(){
    let changedText = <p>{processSentence(currentSentence)}</p>
    ReactDOM.render(changedText,document.getElementById('SceneText'));
    currentSentence = currentSentence+1;
}