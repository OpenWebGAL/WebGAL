function VC_changeBG(bg_name){
    document.getElementById('mainBackground').style.backgroundImage = "url('game/background/" + bg_name + "')";
}

function VC_changeP(P_name) {
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
}