import {WG_ViewControl} from "../../ViewController/ViewControl";

const playVideo = (S_content) => {
    WG_ViewControl.showVideo(S_content);
    return {'ret':false,'autoPlay':false};
}

export default playVideo;