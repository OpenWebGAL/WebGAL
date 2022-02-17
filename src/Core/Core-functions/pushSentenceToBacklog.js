import {getRuntime, getStatus} from "../StoreControl/StoreControl";

const pushSentenceToBacklog = ()=>{
    if (getRuntime().CurrentBacklog.length <= 500) {
        let temp = JSON.stringify(getStatus("all"));
        getRuntime().CurrentBacklog[getRuntime().CurrentBacklog.length] = JSON.parse(temp);
    } else {
        getRuntime().CurrentBacklog.shift();
        let temp = JSON.stringify(getStatus("all"));
        getRuntime().CurrentBacklog[getRuntime().CurrentBacklog.length] = JSON.parse(temp);
    }
}

export default pushSentenceToBacklog;