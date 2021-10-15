import store, {act, actions} from "../store/store";

let GamePlay = (function () {

    let actionMap = {
        vocal: actions.SET_RUNTIME_VOCAL,
        text: actions.SET_RUNTIME_SENTENCE_TEXT,
        name: actions.SET_RUNTIME_SPEAKER_NAME
    }

    /**
     * 通过url地址读取情景文件
     * @param {string} url 文件地址 本地或远程都可以
     */
    function getScene(url) {
        fetch(url)
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
                console.log("[加载成功]", url)
                sentenceProcessor()
            })
            .catch((error) => {
                console.log("[加载失败]", url, error)
            })
    }

    /**
     * 通过 index 读取存档到 runtime 对象中
     * @param {number} index 存档在 saves 对象中的索引值
     */
    function loadSavedGame(index) {
        console.log("[读取]", index)
        act(actions.SET_RUNTIME, store.getState()["saves"][index])
        act(actions.HIDE_LOAD_SCREEN)
        act(actions.HIDE_TITLE_SCREEN)
        act(actions.SHOW_TEXT_BOX)
    }

    /**
     * 将 runtime 对象 保存到 saves 的指定位置
     * @param {number} index 存档在 saves 对象中的索引值
     */
    function saveGame(index) {
        console.log("[存档]", index)
        act(actions.ADD_SAVES, store.getState()['runtime'], index)
    }

    /**
     * 读取下一条脚本
     */
    function nextSentenceProcessor() {
        let index = store.getState()["runtime"].SentenceID || 0
        sentenceProcessor(index + 1)
    }

    /**
     * 读取指定脚本
     * @param {number?} index
     */
    function sentenceProcessor(index) {
        let currentScene = store.getState()["scene"]
        let currentSentenceIndex = index || store.getState()["runtime"].SentenceID || 0
        let currentSentence = currentScene[currentSentenceIndex]

        if (currentSentence === null || currentSentence === undefined) return

        let command = currentSentence[0]
        let payload = currentSentence[1]

        act(actions.SET_RUNTIME_COMMAND, command)
        act(actions.SET_RUNTIME_SENTENCE_ID, currentSentenceIndex)

        switch (command.toUpperCase()) {
            case 'CHANGEBG':
            case 'CHANGEBG_NEXT':
                act(actions.SET_RUNTIME_BACKGROUND, payload)
                break
            case 'CHANGEP':
            case 'CHANGEP_NEXT':
                act(actions.SET_RUNTIME_FIGURE_NAME_MIDDLE, payload)
                break
            case 'CHANGEP_LEFT':
            case 'CHANGEP_LEFT_NEXT':
                act(actions.SET_RUNTIME_FIGURE_NAME_LEFT, payload)
                break
            case 'CHANGEP_RIGHT':
            case 'CHANGEP_RIGHT_NEXT':
                act(actions.SET_RUNTIME_FIGURE_NAME_RIGHT, payload)
                break
            case 'CHANGE_SCENE':
                getScene(`game/scene/${payload}`)
                return;
            case 'CHOOSE':// todo 分支选择界面未完成
                break
            case 'CHOOSE_LABEL':// todo 分支选择界面未完成
                break
            case 'BGM':
                act(actions.SET_RUNTIME_BGM, payload)
                loadBGM(`game/bgm/${payload}`)
                nextSentenceProcessor()
                return
            default:
                let result = processSentence(currentSentence)
                console.log(result)
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

    return {getScene, loadSavedGame, saveGame, nextSentenceProcessor}
})()

export default GamePlay