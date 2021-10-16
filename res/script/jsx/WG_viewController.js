function VC_changeBG(bg_name){
    document.getElementById('mainBackground').style.backgroundImage = "url('game/background/" + bg_name + "')";
}

function VC_changeP(P_name,pos) {
    if(pos ==='center'){
        if (P_name === 'none'){
            ReactDOM.render(<div/>,document.getElementById('figureImage'));
            currentInfo["fig_Name"] = 'none';
        }else{
            let pUrl = "game/figure/"+P_name;
            let changedP = <img src={pUrl} alt='figure' className='p_center'/>
            // console.log('now changing person');
            ReactDOM.render(changedP,document.getElementById('figureImage'));
            currentInfo["fig_Name"] = P_name;
        }
    }else if(pos === 'left'){
        if (P_name === 'none'){
            ReactDOM.render(<div/>,document.getElementById('figureImage_left'));
            currentInfo["fig_Name_left"] = 'none';
        }else{
            let pUrl = "game/figure/"+P_name;
            let changedP = <img src={pUrl} alt='figure' className='p_center'/>
            // console.log('now changing person');
            ReactDOM.render(changedP,document.getElementById('figureImage_left'));
            currentInfo["fig_Name_left"] = P_name;
        }
    }else if(pos === 'right'){
        if (P_name === 'none'){
            ReactDOM.render(<div/>,document.getElementById('figureImage_right'));
            currentInfo["fig_Name_right"] = 'none';
        }else{
            let pUrl = "game/figure/"+P_name;
            let changedP = <img src={pUrl} alt='figure' className='p_center'/>
            // console.log('now changing person');
            ReactDOM.render(changedP,document.getElementById('figureImage_right'));
            currentInfo["fig_Name_right"] = P_name;
        }
    }
}

function VC_choose(selection,mode){
    if(mode === 'scene'){
        document.getElementById('chooseBox').style.display = 'flex';
        let elements = []
        for (let i = 0; i < selection.length; i++) {
            let temp = <div className='singleChoose' key={i} onClick={()=>{chooseScene(selection[i][1]);}}>{selection[i][0]}</div>
            elements.push(temp)
        }
        ReactDOM.render(<div>{elements}</div>,document.getElementById('chooseBox'))
    }
    if(mode === 'label'){
        document.getElementById('chooseBox').style.display = 'flex';
        let elements = []
        for (let i = 0; i < selection.length; i++) {
            let temp = <div className='singleChoose' key={i} onClick={()=>{chooseJumpFun(selection[i][1]);}}>{selection[i][0]}</div>
            elements.push(temp)
        }
        ReactDOM.render(<div>{elements}</div>,document.getElementById('chooseBox'))
    }
}

function VC_textShow(name,text){
    let changedName = <span>{name}</span>
    let textArray = text.split("");
    ReactDOM.render(changedName, document.getElementById('pName'));
    showTextArray(textArray);
}

function loadBGM() {
    let bgmName = currentInfo["bgm"];
    if(bgmName === '' || bgmName === 'none'){
        ReactDOM.render(<div/>,document.getElementById("bgm"));
        return;
    }
    let url = "./game/bgm/"+bgmName;
    let audio = <audio src={url} id={"currentBGM"} loop="loop"/>
    ReactDOM.render(audio,document.getElementById("bgm"));
    let playControl = document.getElementById("currentBGM");
    playControl.currentTime = 0;
    playControl.volume = 0.25;
    playControl.play();
}

function playVocal() {
    let vocalName = currentInfo["vocal"];
    let url = './game/vocal/'+vocalName;
    let vocal = <audio src={url} id={"currentVocal"}/>
    ReactDOM.render(vocal,document.getElementById('vocal'));
    let VocalControl = document.getElementById("currentVocal");
    VocalControl.currentTime = 0;
    VocalControl.play();
}

function showIntro(text){
    let i = 0;
    let IntroView =
        <div>
            <div id={"textShowArea"} className={"textShowArea_styl"}>
            </div>
        </div>
    ;
    ReactDOM.render(IntroView,document.getElementById("intro"));
    ReactDOM.render(<div>{" "}</div>,document.getElementById("textShowArea"));
    document.getElementById("intro").style.display = 'block';
    let textArray = text.split(',');
    let introInterval = setInterval(textShow,1500);
    let introAll = [];
    function textShow(){
        let singleRow = <div className={"introSingleRow"}>{textArray[i]}</div>;
        introAll.push(singleRow);
        i = i+1;
        ReactDOM.render(<div>{introAll}</div>,document.getElementById("textShowArea"));
        if(i>= textArray.length){
            clearInterval(introInterval);
            setTimeout(clearIntro,3500);
        }
    }
}

// 渐显文字
function showTextArray(textArray){
    showingText = false;
    ReactDOM.render(<span> </span>, document.getElementById('SceneText'));
    let elementArray = [];
    let i = 0;
    clearInterval(interval);
    var interval = setInterval(showSingle,textShowWatiTime);
    showingText = true;
    function showSingle() {
        if(!showingText){
            let textFull = '';
            for (let j = 0;j<textArray.length;j++){
                textFull = textFull+textArray[j];
            }
            ReactDOM.render(<div>{textFull}</div>, document.getElementById('SceneText'));
            if(auto === 1){
                if(i < textArray.length + 1){
                    i = textArray.length + 1;
                }else{
                    i = i+1;
                }
            }else{
                i = textArray.length + 1 +(autoWaitTime/35);
            }

        }else{
            let tempElement = <span key={i} className='singleWord'>{textArray[i]}</span>
            elementArray.push(tempElement);
            ReactDOM.render(<div>{elementArray}</div>, document.getElementById('SceneText'));
            i = i+1;
        }
        if(i > textArray.length && auto !== 1){
            showingText = false;
        }
        if(i > textArray.length +(autoWaitTime/35)){

            if(auto === 1){
                if(document.getElementById('currentVocal')&&fast === 0){
                    if(document.getElementById('currentVocal').ended)
                    {
                        clearInterval(interval);
                        showingText = false;
                        nextSentenceProcessor();
                    }
                }else{
                    clearInterval(interval);
                    showingText = false;
                    nextSentenceProcessor();
                }
            }else{
                showingText = false;
                clearInterval(interval);
            }

        }
    }
}
