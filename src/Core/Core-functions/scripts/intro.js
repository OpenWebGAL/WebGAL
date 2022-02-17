import {WG_ViewControl} from "../../ViewController/ViewControl";

const intro = (S_content) => {
    WG_ViewControl.showIntro(S_content);
    return {'ret': true, 'autoPlay': false};
}

export default intro;