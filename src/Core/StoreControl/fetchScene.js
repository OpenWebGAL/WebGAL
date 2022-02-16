import axios from "axios";
import logger from "../util/logger";

const parseScene = (sceneText) => {
    let newScene = sceneText.split('\n');
    for (let i = 0; i < newScene.length; i++) {
        let tempSentence = newScene[i].split(";")[0];
        let commandLength = tempSentence.split(":")[0].length;
        let command = newScene[i].split(":")[0];
        let content = tempSentence.slice(commandLength + 1);
        content = content.split(';')[0];
        command = command.split(';')[0];
        newScene[i] = newScene[i].split(":");
        newScene[i][0] = command;
        newScene[i][1] = content;
    }
    return newScene;
}

const fetchScene = (url) => {
    return new Promise(resolve => {
        axios.get(url).then(r => {
            logger.info('请求场景完成');
            resolve(parseScene(r.data));
        }).catch(e => {
            logger.error('读取场景失败', e);
            resolve([['错误', '读取场景失败']]);
        });
    })
}


export default fetchScene;