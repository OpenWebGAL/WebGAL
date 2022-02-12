import ReactDOM from "react-dom";
import {getRuntime, getStatus, SyncCurrentStatus} from "../../StoreControl/StoreControl";
import {WG_ViewControl} from "../ViewControl";

const restoreStatus = (savedStatus) => {
    console.log("restoring")
    console.log(savedStatus)
    let command = savedStatus["command"];
    //恢复背景的移动和效果
    if (savedStatus['bg_transform'] !== '') {
        document.getElementById('mainBackground').style.transform = savedStatus['bg_transform'];
    }
    if (savedStatus['bg_filter'] !== '') {
        document.getElementById('mainBackground').style.filter = savedStatus['bg_filter'];
    }
    if (savedStatus["bg_Name"] !== '') document.getElementById('mainBackground').style.backgroundImage = "url('game/background/" + savedStatus["bg_Name"] + "')";
    if (savedStatus["fig_Name"] === '' || savedStatus["fig_Name"] === 'none') {
        ReactDOM.render(<div/>, document.getElementById('figureImage'));
    } else {
        let pUrl = "game/figure/" + savedStatus["fig_Name"];
        let changedP = <img src={pUrl} alt='figure' className='p_center'/>
        // console.log('now changing person');
        ReactDOM.render(changedP, document.getElementById('figureImage'));
    }
    if (savedStatus["fig_Name_left"] === '' || savedStatus["fig_Name_left"] === 'none') {
        ReactDOM.render(<div/>, document.getElementById('figureImage_left'));
    } else {
        let pUrl = "game/figure/" + savedStatus["fig_Name_left"];
        let changedP = <img src={pUrl} alt='figure' className='p_center'/>
        // console.log('now changing person');
        ReactDOM.render(changedP, document.getElementById('figureImage_left'));
    }
    if (savedStatus["fig_Name_right"] === '' || savedStatus["fig_Name_right"] === 'none') {
        ReactDOM.render(<div/>, document.getElementById('figureImage_right'));
    } else {
        let pUrl = "game/figure/" + savedStatus["fig_Name_right"];
        let changedP = <img src={pUrl} alt='figure' className='p_center'/>
        // console.log('now changing person');
        ReactDOM.render(changedP, document.getElementById('figureImage_right'));
    }
    if (command === 'choose' || command === 'choose_label') {
        let chooseItems = savedStatus["choose"];
        chooseItems = chooseItems.split("}")[0];
        chooseItems = chooseItems.split("{")[1];
        let selection = chooseItems.split(',')
        for (let i = 0; i < selection.length; i++) {
            selection[i] = selection[i].split(":");
        }
        let choose_mode = '';
        // eslint-disable-next-line default-case
        switch (command) {
            case 'choose':
                choose_mode = 'scene';
                break;
            case 'choose_label':
                choose_mode = 'label';
                break;
        }
        WG_ViewControl.VC_choose(selection, choose_mode);
    }
    let changedName = <span>{savedStatus["showName"]}</span>
    let textArray = savedStatus["showText"].split("");
    ReactDOM.render(changedName, document.getElementById('pName'));
    SyncCurrentStatus('vocal', savedStatus['vocal']);
    if (getStatus('bgm') !== savedStatus['bgm']) {
        getRuntime().currentInfo['bgm'] = savedStatus['bgm'];
        WG_ViewControl.loadBGM();
    }
    if (savedStatus['miniAvatar'] !== '' || savedStatus['miniAvatar'] !== 'none') {
        WG_ViewControl.VC_showMiniAvatar(savedStatus['miniAvatar']);
    }
    WG_ViewControl.playVocal();
    WG_ViewControl.showTextArray(textArray);
}

export default restoreStatus;