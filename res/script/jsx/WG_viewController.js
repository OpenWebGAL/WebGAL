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

function VC_choose(selection){
    document.getElementById('chooseBox').style.display = 'flex';
    let elements = []
    for (let i = 0; i < selection.length; i++) {
        let temp = <div className='singleChoose' key={i} onClick={()=>{chooseScene(selection[i][1]);}}>{selection[i][0]}</div>
        elements.push(temp)
    }
    ReactDOM.render(<div>{elements}</div>,document.getElementById('chooseBox'))
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