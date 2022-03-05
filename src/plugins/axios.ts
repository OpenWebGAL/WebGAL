import axios from "axios";
import logger from "@/utils/logger";

const parseScene = (sceneText: string) => {
    let newScene = sceneText.split('\n');
    return newScene.map(o => {
        let tempSentence = o.split(";")[0];
        let commandLength = tempSentence.split(":")[0].length;
        let command = o.split(":")[0];
        let content = tempSentence.slice(commandLength + 1);
        content = content.split(';')[0];
        command = command.split(';')[0];
        return [command, content]
    });
}

const fetchScene = (url: string) => {
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