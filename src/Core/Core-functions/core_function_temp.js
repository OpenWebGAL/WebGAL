// //处理特殊脚本
// import {setVar, varProcess} from "./varProcess";
// import {ifJump, jumpSentence} from "./sentenceJump";
// import {WG_ViewControl} from "../ViewController/ViewControl";
// import {getRuntime, getScene, getStatus, SyncCurrentStatus} from "../StoreControl/StoreControl";
// import {processSelection, processSentence} from "../util/WG_util";
// import logger from "../util/logger";
// import {increaseSentence} from "../WG_core";
// import pushSentenceToBacklog from "./pushSentenceToBacklog";

// if (command.substring(0, 3) === "var" || command.substring(0, 8) === "jump_var") {
//     varProcess(command, S_content);
//     return;
// }
// if (command.substring(0, 2) === 'if') {
//     ifJump(command, S_content);
//     return;
// }


// if (command === 'changeBG') {
//     WG_ViewControl.VC_changeBG(S_content);//界面控制：换背景
//     SyncCurrentStatus("bg_Name", S_content);//同步当前状态
//     autoPlay('on');//在非next语句下调用autoplay
// }//改背景
// else if (command === 'changeP') {
//     WG_ViewControl.VC_changeP(S_content, 'center');
//     SyncCurrentStatus('fig_Name', S_content);
//     autoPlay('on');
// }//改立绘
// else if (command === 'changeP_left') {
//     WG_ViewControl.VC_changeP(S_content, 'left');
//     SyncCurrentStatus('fig_Name_left', S_content);
//     autoPlay('on');
// } else if (command === 'changeP_right') {
//     WG_ViewControl.VC_changeP(S_content, 'right');
//     SyncCurrentStatus('fig_Name_right', S_content);
//     autoPlay('on');
// } else if (command === 'changeP_next') {
//     WG_ViewControl.VC_changeP(S_content, 'center');
//     SyncCurrentStatus('fig_Name', S_content);
//     increaseSentence();
//     nextSentenceProcessor();
//     return;
// } else if (command === 'changeP_left_next') {
//     WG_ViewControl.VC_changeP(S_content, 'left');
//     SyncCurrentStatus('fig_Name_left', S_content);
//     increaseSentence();
//     nextSentenceProcessor();
//     return;
// } else if (command === 'changeP_right_next') {
//     WG_ViewControl.VC_changeP(S_content, 'right')
//     SyncCurrentStatus('fig_Name_right', S_content);
//     increaseSentence();
//     nextSentenceProcessor();
//     return;
// }
// else if (command === 'changeBG_next') {
//     WG_ViewControl.VC_changeBG(S_content);
//     increaseSentence();
//     SyncCurrentStatus("bg_Name", S_content);
//     nextSentenceProcessor();
//     return;
// }
// else if (command === 'changeScene') {
//     let sUrl = "game/scene/" + thisSentence[1];
//     getScene(sUrl);
//     SyncCurrentStatus('SceneName', S_content);
//     return;
// } else if (command === 'choose') {
    // noinspection DuplicatedCode
    // SyncCurrentStatus('command', command);
    // SyncCurrentStatus('choose', S_content);
    // const selection = processSelection(S_content);
    // WG_ViewControl.VC_choose(selection, 'scene');
    // return;
// }
// else if (command === 'bgm') {
//     SyncCurrentStatus('bgm', S_content);
//     // getRuntime().currentInfo["bgm"] =  S_content;
//     WG_ViewControl.loadBGM();
//     increaseSentence();
//     nextSentenceProcessor();
//     return;
// }
// else if (command === 'choose_label') {
//     // noinspection DuplicatedCode
//     SyncCurrentStatus('command', command);
//     SyncCurrentStatus('choose', S_content);
//     const selection = processSelection(S_content);
//     WG_ViewControl.VC_choose(selection, 'label')
//     return;
// }
// else if (command === 'jump_label') {
//     let lab_name = thisSentence[1];
//     //find the line of the label:
//     jumpSentence(lab_name);
//     return;
// }
// else if (command === 'label') {
//     increaseSentence();
//     nextSentenceProcessor();
//     return;
// }
// else if (command === 'intro') {
//     let introText = thisSentence[1];
//     WG_ViewControl.showIntro(introText);
//     return;
// }
// else if (command === 'miniAvatar') {
//     WG_ViewControl.VC_showMiniAvatar(S_content);
//     SyncCurrentStatus('miniAvatar', S_content);
//     increaseSentence();
//     nextSentenceProcessor();
//     return;
// }
// else if (command.substring(0, 3) === "var" || command.substring(0, 8) === "jump_var") {
//     varProcess(command, S_content);
//     return;
// }
// else if (command === 'showVar') {
//     logger.info("显示变量");
//     SyncCurrentStatus('command', command);
//     SyncCurrentStatus('showName', command);
//     SyncCurrentStatus('showText', JSON.stringify(getRuntime().currentInfo.GameVar));
//     WG_ViewControl.VC_textShow(getStatus('showName'), getStatus('showText'));
//     pushSentenceToBacklog();
// }
// else if (command.substring(0, 2) === 'if') {
//     ifJump(command, S_content);
//     return;
// }
// else if (command === 'setBgTransform') {
//     setTimeout(() => {
//         WG_ViewControl.VC_setBGtransform(S_content);
//     }, 100);
//     SyncCurrentStatus('bg_transform', S_content);
//     increaseSentence();
//     nextSentenceProcessor();
//     return;
// }
// else if (command === 'setBgFilter') {
//     setTimeout(() => {
//         WG_ViewControl.VC_setBGfilter(S_content);
//     }, 100);
//     SyncCurrentStatus('bg_filter', S_content);
//     increaseSentence();
//     nextSentenceProcessor();
//     return;
// }
// else if (command === 'setVar') {
//     setVar(S_content)
//     increaseSentence();
//     nextSentenceProcessor();
//     return;
// }
// else if (command === 'setFigAni') {
//     let pos = S_content.split(',')[0];
//     let aniName = S_content.split(',')[1];
//     let aniTime = S_content.split(',')[2];
//     WG_ViewControl.VC_setAnimationByClass('figureContainer' + pos, aniName, aniTime);
//     increaseSentence();
//     nextSentenceProcessor();
//     return;
// }
// else if (command === 'setBgAni') {
//     let aniName = S_content.split(',')[0];
//     let aniTime = S_content.split(',')[1];
//     WG_ViewControl.VC_setAnimationById('mainBackground', aniName, aniTime);
//     increaseSentence();
//     nextSentenceProcessor();
//     return;
// }
// else if (command === 'playVideo') {
//     WG_ViewControl.showVideo(S_content);
// }
// else if (command === 'pixiInit') {
//     getRuntime().currentInfo['pixiPerformList'] = [];
//     WG_ViewControl.VC_PIXI_Create();
//     increaseSentence();
//     nextSentenceProcessor();
//     return;
// } else if (command === 'pixiPerform') {
//     const performType = S_content;
//     const option = {};
//     const pixiOption = {performType: performType, option: option};
//     getRuntime().currentInfo['pixiPerformList'].push(pixiOption);
//     WG_ViewControl.VC_PIXI_perform(performType, option);
//     increaseSentence();
//     nextSentenceProcessor();
//     return;
// // } else {
//     SyncCurrentStatus('command', processSentence(getStatus("SentenceID"))['name']);
//     SyncCurrentStatus('showName', processSentence(getStatus("SentenceID"))['name']);
//     SyncCurrentStatus('showText', processSentence(getStatus("SentenceID"))['text']);
//     SyncCurrentStatus('vocal', processSentence(getStatus("SentenceID"))['vocal']);
//     WG_ViewControl.VC_textShow(getStatus('showName'), getStatus('showText'));
//     if (getStatus("all")["vocal"] !== '') {
//         WG_ViewControl.playVocal();
//     }
//     pushSentenceToBacklog();
// }