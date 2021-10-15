import store, {act, actions} from "../store/store";

let GamePlay = (function () {

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
        act(actions.SET_RUNTIME, store.getState()["saves"][index])
        console.log("[读取]", index)
    }

    /**
     * 将 runtime 对象 保存到 saves 的指定位置
     * @param {number} index 存档在 saves 对象中的索引值
     */
    function saveGame(index) {
        act(actions.ADD_SAVES, store.getState()['runtime'], index)
        console.log("[存档]", index)
    }



    return {getScene, loadSavedGame, saveGame}
})()

export default GamePlay