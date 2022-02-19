import {getRuntime} from "../../Core/StoreControl/StoreControl";
import ReactDOM from "react-dom";
import {Return, VolumeNotice} from "@icon-park/react";
import {userInteract} from "../../Core/InteractController/UserInteract";
import logger from "../../Core/util/logger";
import {isMobile} from "../../Core/util/WG_util";

const BackLog = (props) => {
    let showBacklogList = [];
    let size;
    let buttonClassName;
    if (isMobile()) {
        size = 14;
        buttonClassName = 'backlog_interact_button_mobile';
    } else {
        size = 24;
        buttonClassName = 'backlog_interact_button';
    }

    const playBacklogVoice = (i) => {
        let vocalName = getRuntime().CurrentBacklog[i].vocal;
        if (vocalName !== '') {
            let url = './game/vocal/' + vocalName;
            let elementAudio = <audio src={url} id={"backlogVocalAudio-" + i}/>
            logger.info("播放回溯语音" + url);
            ReactDOM.render(elementAudio, document.getElementById("backlogVocal-" + i));
            let singleControlBacklogAudio = document.getElementById("backlogVocalAudio-" + i);
            let played = false;
            played = false;
            singleControlBacklogAudio.oncanplay = function () {
                if (!played) {
                    singleControlBacklogAudio.currentTime = 0;
                    played = true;
                    singleControlBacklogAudio.play();
                }
                singleControlBacklogAudio.play();
            }
            if (!played) {
                singleControlBacklogAudio.currentTime = 0;
                played = true;
                singleControlBacklogAudio.play();
            }
        }
    }
    // console.log(getRuntime().CurrentBacklog)
    for (let i = 0; i < getRuntime().CurrentBacklog.length; i++) {
        let temp = <div className={'backlog_singleElement'} key={i} style={{
            opacity: 0,
            animationFillMode: 'forwards',
            animationDelay: '' + 20 * (getRuntime().CurrentBacklog.length - i) + 'ms'
        }}>
            <div className={"backlog_interact"}>
                <div className={buttonClassName} onClick={() => playBacklogVoice(i)}>
                    <VolumeNotice theme="outline" size={size} fill="#f5f5f7"/>
                </div>
                <div className={buttonClassName} onClick={() => {
                    userInteract.jumpFromBacklog(i);
                }}>
                    <Return theme="outline" size={size} fill="#f5f5f7"/>
                </div>
            </div>
            <div className={"backlog_name"}>{getRuntime().CurrentBacklog[i].showName}</div>

            <div className={"backlog_content"}>

                <div className={"backlog_text"}>{getRuntime().CurrentBacklog[i].showText}</div>
            </div>
            <div id={"backlogVocal-" + i}>

            </div>
        </div>
        showBacklogList.push(temp)
    }

    return <div>{showBacklogList}</div>
}

export default BackLog;