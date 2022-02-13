import {getRuntime} from "../../Core/StoreControl/StoreControl";
import ReactDOM from "react-dom";
import {Return, VolumeNotice} from "@icon-park/react";
import {userInteract} from "../../Core/InteractController/UserInteract";

const BackLog = (props) => {
    let showBacklogList = [];
    // console.log(getRuntime().CurrentBacklog)
    for (let i = 0; i < getRuntime().CurrentBacklog.length; i++) {
        let temp = <div className={'backlog_singleElement'} key={i} style={{
            opacity: 0,
            animationFillMode: 'forwards',
            animationDelay: '' + 0.07 * (getRuntime().CurrentBacklog.length - i) + 's'
        }}>
            <div className={"backlog_interact"}>
                <div className={"backlog_interact_button"} onClick={() => {
                    let vocalName = getRuntime().CurrentBacklog[i].vocal;
                    if (vocalName !== '') {
                        let url = './game/vocal/' + vocalName;
                        let elementAudio = <audio src={url} id={"backlogVocalAudio-" + i}/>
                        console.log("Playing! now url is" + url);
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
                }}>
                    <VolumeNotice theme="outline" size="24" fill="#f5f5f7"/>
                </div>
                <div className={"backlog_interact_button"} onClick={() => {
                    userInteract.jumpFromBacklog(i);
                }}>
                    <Return theme="outline" size="24" fill="#f5f5f7"/>
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