import store, {act, actions} from "../store/store";

let GamePlay = (function () {

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

    function loadSavedGame(index) {
        act(actions.SET_RUNTIME, store.getState()["saves"][index])
        console.log(store.getState()["saves"][index])
    }

    return {getScene, loadSavedGame}
})()

export default GamePlay