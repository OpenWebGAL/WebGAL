import Store, {act, actions} from "../store/Store";
import {uiActions} from "../store/UiStore";
import {cActions} from "../store/CurrentInfoStore";

let GamePlay = (function () {

    let actionMap = {
        vocal: cActions.SET_RUNTIME_VOCAL,
        text: cActions.SET_RUNTIME_SENTENCE_TEXT,
        name: cActions.SET_RUNTIME_SPEAKER_NAME
    }

    /**
     * 通过url地址读取情景文件
     * @param url 文件地址 本地或远程都可以
     * @returns {Promise<string>} 返回一个Promise对象，可继续链式调用
     */
    function getScene(url) {
        return fetch(url)
            .then((r) => r.text())
            .then((data) => {
                data = data.split('\n');
                for (let i = 0; i < data.length; i++) {
                    let tempSentence = data[i].split(";")[0];
                    let commandLength = tempSentence.split(":")[0].length;
                    let content = tempSentence.slice(commandLength + 1);
                    let command = data[i].split(":")[0];
                    command = command.split(';')[0];
                    data[i] = data[i].split(":");
                    data[i][0] = command;
                    data[i][1] = content;
                }
                act(actions.SET_SCENE, data)
                act(cActions.SET_RUNTIME_SCENE_NAME, url)
                console.log("[加载成功]", url)
            })
            .catch((error) => {
                console.log("[加载失败]", url, error)
            })
    }

    /**
     * 通过 index 读取存档到 runtime 对象中
     * @param {number} index 存档在 saves 对象中的索引值
     */
    function loadGame(index) {
        console.log("[读取]", index)
        let loadResult = Store.getState()["saves"][index]

        getScene(loadResult.SceneName).then(() => {
            act(cActions.SET_RUNTIME, loadResult)
            act(uiActions.SET_LOAD_SCREEN, false)
            act(uiActions.SET_TITLE_SCREEN, false)
            act(uiActions.SET_TEXT_BOX, true)
        })
    }

    /**
     * 将 runtime 对象 保存到 saves 的指定位置
     * @param {number} index 存档在 saves 对象中的索引值
     */
    function saveGame(index) {
        console.log("[存档]", index)
        act(actions.ADD_SAVES, Store.getState()['runtime'], index)
    }

    /**
     * 判断是否正在显示文字
     * @returns {boolean}
     */
    function checkIsShowingText() {
        let isShowingText = Store.getState()["temp"].isShowingText

        if (isShowingText) act(actions.SET_TEMP_IS_SHOWING_TEXT, false)

        return isShowingText
    }

    /**
     * 读取下一条脚本
     */
    function nextSentenceProcessor() {
        // 如果正在显示文字，则不解析下一句，并结束显示文字的动画
        if (checkIsShowingText()) return

        let index = Store.getState()["runtime"].SentenceID || 0
        sentenceProcessor(index + 1)
    }

    /**
     * 读取指定脚本
     * @param {number} index
     */
    function sentenceProcessor(index) {
        if (index == null) return

        let currentScene = Store.getState()["scene"]
        let currentSentence = currentScene[index]

        if (currentSentence === null || currentSentence === undefined) return

        let command = currentSentence[0]
        let payload = currentSentence[1]

        act(cActions.SET_RUNTIME_COMMAND, command)
        act(cActions.SET_RUNTIME_SENTENCE_ID, index)

        switch (command.toUpperCase()) {
            case 'CHANGEBG':
            case 'CHANGEBG_NEXT':
                act(cActions.SET_RUNTIME_BACKGROUND, payload)
                break
            case 'CHANGEP':
            case 'CHANGEP_NEXT':
                act(cActions.SET_RUNTIME_FIGURE_NAME_MIDDLE, payload)
                break
            case 'CHANGEP_LEFT':
            case 'CHANGEP_LEFT_NEXT':
                act(cActions.SET_RUNTIME_FIGURE_NAME_LEFT, payload)
                break
            case 'CHANGEP_RIGHT':
            case 'CHANGEP_RIGHT_NEXT':
                act(cActions.SET_RUNTIME_FIGURE_NAME_RIGHT, payload)
                break
            case 'CHANGE_SCENE':
                getScene(`game/scene/${payload}`).then(() => {

                })
                return;
            case 'CHOOSE':// todo 分支选择界面未完成
                break
            case 'CHOOSE_LABEL':// todo 分支选择界面未完成
                break
            case 'BGM':
                act(cActions.SET_RUNTIME_BGM, payload)
                loadBGM(`game/bgm/${payload}`)
                nextSentenceProcessor()
                return
            default:
                let result = processSentence(currentSentence)
                Object.keys(result).forEach((key) => act(actionMap[key], result[key]))
                break
        }

        if (command.endsWith('next')) {
            nextSentenceProcessor()
            return
        }
    }

    /**
     * 解析不带有 command 的脚本句子
     * @param {string[]} sentence
     * @returns {{vocal: string?, name: string?, text: string?} | {}}
     */
    function processSentence(sentence) {
        if (sentence === null) return {}
        let result = {}

        if (sentence[0] != null && sentence[0] !== '' && sentence[1] === '') {
            if (sentence[0].includes("vocal-")) {
                Object.assign(result, departVocalAndText(sentence[0]))
            } else {
                Object.assign(result, {text: sentence[0]})
            }
        } else {
            Object.assign(result, {name: sentence[0], ...departVocalAndText(sentence[1])})
        }
        return result
    }


    /**
     * 拆分 "vocal-V4.ogg,方便帮我开门吗" 格式的字符串 为 ['V4.ogg','方便帮我开门吗']
     * @param {string} temp
     * @returns {{text: string, vocal: string}|{}}
     */
    function departVocalAndText(temp) {
        let result = {}
        if (typeof temp === 'string') {
            let vocal = temp.split('vocal-')[1].split(',')[0]
            let text = temp.split('vocal-')[1].split(',')[1]

            result = {text: text, vocal: vocal}
        }
        return result
    }

    /**
     * 加载播放BGM
     * @param url 音频文件的地址
     */
    function loadBGM(url) {
        // todo 要做一个音频播放组件
    }

    return {getScene, loadSavedGame: loadGame, saveGame, nextSentenceProcessor, sentenceProcessor}
})()

export default GamePlay