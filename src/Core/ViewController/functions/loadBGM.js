import {getRuntime} from "../../StoreControl/StoreControl";
import ReactDOM from "react-dom";
import logger from "../../util/logger";

const loadBGM = () => {
    let bgmName = getRuntime().currentInfo["bgm"];
    logger.info("正在播放 " + bgmName);
    // console.log(getRuntime().currentInfo);
    if (bgmName === '' || bgmName === 'none') {
        logger.warn("清除bgm");
        if (document.getElementById("currentBGM")) {
            document.getElementById("currentBGM").autoplay = false;
            document.getElementById("currentBGM").pause();
        }
        ReactDOM.render(<div/>, document.getElementById("bgm"));
        return;
    }
    let url = "./game/bgm/" + bgmName;
    let audio = <audio src={url} id={"currentBGM"} loop="loop"/>
    // console.log("replace old bgm with an empty div")
    // ReactDOM.render(<div/>,document.getElementById("bgm"));
    ReactDOM.render(audio, document.getElementById("bgm"), audioRendered);

    function audioRendered() {
        let playControl = document.getElementById("currentBGM");
        let played = false;
        playControl.oncanplay = function () {
            if (played === false) {
                playControl.currentTime = 0;
                playControl.volume = 0.25;
                played = true;
                playControl.play();
            }
        }
        if (played === false && document.getElementById("currentBGM")) {
            playControl.currentTime = 0;
            playControl.volume = 0.25;
            played = true;
            playControl.play();
        }
    }
}

export default loadBGM;