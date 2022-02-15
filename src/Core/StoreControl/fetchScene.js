import axios from "axios";
import logger from "../util/logger";
import {getRuntime, getStatus} from "./StoreControl";
import {prefetcher} from "../util/PrefetchWrapper";

const parseScene = (sceneText) => {
    let newScene = sceneText.split('\n');
    for (let i = 0; i < newScene.length; i++) {
        let tempSentence = newScene[i].split(";")[0];
        let commandLength = tempSentence.split(":")[0].length;
        let command = newScene[i].split(":")[0];
        let content = tempSentence.slice(commandLength + 1);
        content = content.split(';')[0];
        command = command.split(';')[0];
        newScene[i] = getRuntime().currentScene[i].split(":");
        newScene[i][0] = command;
        newScene[i][1] = content;
    }
    return newScene;
}

const fetchScene = (url) => {
    axios.get(url).then(r => {
        logger.info('请求场景结果：', r);
        prefetcher.onSceneChange(url, getStatus('SentenceID'));
        return parseScene(r.data);
    }).catch(e => {
        logger.error('读取场景失败', e);
        return [['error', '读取场景失败']];
    });
}


export default fetchScene;