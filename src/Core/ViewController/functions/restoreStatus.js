import {getRuntime, getStatus, SyncCurrentStatus} from "../../StoreControl/StoreControl";
import {WG_ViewControl} from "../ViewControl";
import {processSelection} from "../../util/WG_util";

const restoreStatus = (savedStatus) => {
    const command = savedStatus["command"];
    //恢复对话
    WG_ViewControl.VC_textShow(savedStatus['showName'],savedStatus['showText']);
    //恢复背景的移动和效果
    if (savedStatus['bg_transform'] !== '') {
        document.getElementById('mainBackground').style.transform = savedStatus['bg_transform'];
    }
    if (savedStatus['bg_filter'] !== '') {
        document.getElementById('mainBackground').style.filter = savedStatus['bg_filter'];
    }

    //不重置设置背景
    if (savedStatus["bg_Name"] !== '')
        document.getElementById('mainBackground').style.backgroundImage = "url('game/background/" + savedStatus["bg_Name"] + "')";

    // 处理立绘
    WG_ViewControl.VC_changeP(savedStatus["fig_Name_left"],'left');
    WG_ViewControl.VC_changeP(savedStatus["fig_Name"],'center');
    WG_ViewControl.VC_changeP(savedStatus["fig_Name_right"],'right');

    // 处理choose
    if (command === 'choose' || command === 'choose_label') {
        const selection = processSelection(savedStatus["choose"]);
        const choose_mode = command==='choose'?'scene':'label';
        WG_ViewControl.VC_choose(selection, choose_mode);
    }
    // 处理小头像
    WG_ViewControl.VC_showMiniAvatar(savedStatus['miniAvatar']);
    //控制bgm
    if (getStatus('bgm') !== savedStatus['bgm']) {
        getRuntime().currentInfo['bgm'] = savedStatus['bgm'];
        WG_ViewControl.loadBGM();
    }
    //重播语音
    SyncCurrentStatus('vocal', savedStatus['vocal']);
    WG_ViewControl.playVocal();

    //还原演出效果
    for(const perform of savedStatus.pixiPerformList){
        WG_ViewControl.VC_PIXI_Create();
        WG_ViewControl.VC_PIXI_perform(perform.performType,perform.option);
    }
}

export default restoreStatus;