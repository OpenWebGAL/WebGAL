/**
 * 集中管理的音频播放控制器，可自由添加音轨，通过 key 来对指定音轨进行操作
 *
 */
export default (function () {
    const createAudioContext = window.AudioContext || window["webkitAudioContext"] || window["mozAudioContext"] || window["msAudioContext"];

    /**
     * @type {AudioContext | null}
     */
    let audioContext = null

    /**
     * 播放音频的一个源 （由AudioContext创建，可以创建多个用来做多轨播放）
     * @type {{VOCAL: {}, MAIN_BGM: {}, SCENE_BGM: {}}}
     */
    let sources = {
        MAIN_BGM: {
            source: null,
            loop: true,
            status: 0,
            arrayBuffer: null,
            audioBuffer: null
        },
        SCENE_BGM: {
            source: null,
            loop: true,
            status: 0,
            arrayBuffer: null,
            audioBuffer: null
        },
        VOCAL: {
            source: null,
            loop: false,
            status: 0,
            arrayBuffer: null,
            audioBuffer: null
        }
    };
    let sourcesMap = {
        MAIN_BGM: "MAIN_BGM",
        SCENE_BGM: "SCENE_BGM",
        VOCAL: "VOCAL"
    };

    const STOP = -1;
    const READY = 0;
    const PLAYING = 1;

    /**
     *
     * 判断指定 source 是否已经播放完毕
     * @param targetSourceKey {String} 指定需要检查状态的音轨名
     */
    const isSourceEnded = (targetSourceKey) => {
        if (!checkSourcesExist(targetSourceKey)) return null;

        return sources[targetSourceKey].status === STOP
    }

    /**
     *
     * @param targetSourceKey {String} 指定需要检查是否存在的音轨名
     */
    const checkSourcesExist = (targetSourceKey) => {
        let result = sources.hasOwnProperty(targetSourceKey);
        if (!result) console.error(`[AudioContext] ${targetSourceKey} in sources is not exist.`);
        return result;
    }

    /**
     * 初始化 AudioContext （应该在用户第一次与网页交互[onclick,onkeydown...]以后进行）
     */
    const initAudioContext = () => {
        if (audioContext != null) return

        audioContext = new createAudioContext();
        for (let key in sources) {
            let status = sources[key].status

            if (status === READY) initSound(key)
        }
    }

    /**
     * 开始播放
     * @param targetSourceKey {String}
     */
    const start = (targetSourceKey) => {
        if (!checkSourcesExist(targetSourceKey)) return;

        if (audioContext == null) {
            console.error("[AudioContext] has not been initialized.");
            return;
        }

        sources[targetSourceKey].status = PLAYING;
        sources[targetSourceKey].source = audioContext.createBufferSource();
        let source = sources[targetSourceKey].source
        source.buffer = sources[targetSourceKey].audioBuffer;
        source.loop = sources[targetSourceKey].loop;
        source.onended = () => sources[targetSourceKey].status = STOP
        source.connect(audioContext.destination);
        source.start(0);
    }

    /**
     * 停止播放
     * @param targetSourceKey {String}
     */
    const stop = (targetSourceKey) => {
        if (!checkSourcesExist(targetSourceKey)) return;

        sources[targetSourceKey].status = STOP;
        let source = sources[targetSourceKey].source
        if (source) {
            source.stop(0);
        }
    }

    /**
     * 解码 ArrayBuffer 为 AudioBuffer 供后续 start() 方法使用
     * @param targetSourceKey {String} 指定需要在那条音轨上播放
     */
    const initSound = (targetSourceKey) => {
        if (!checkSourcesExist(targetSourceKey)) return;

        if (audioContext == null) {
            sources[targetSourceKey].status = READY
            console.warn(`[AudioContext] has not been initialized, stored the ${targetSourceKey} task.`);
            return
        }

        let arrayBuffer = sources[targetSourceKey].arrayBuffer
        if (arrayBuffer == null) {
            console.warn(`[AudioContext] ${targetSourceKey} arrayBuffer is null now.`)
            return
        }

        audioContext.decodeAudioData(arrayBuffer, (buffer) => { //解码成功时的回调函数
            sources[targetSourceKey].audioBuffer = buffer;
            start(targetSourceKey);
        }, e => console.error("[AudioContext] decoding file failed.", e));
    }

    /**
     * 加载指定 url 音频文件的 ArrayBuffer
     * @param targetSourceKey {String} 指定需要在那条音轨上播放
     * @param url {String} 所需加载的文件地址
     * @param autoplay {Boolean?} 是否需要加载完成后自动播放
     */
    function loadAudioFile(targetSourceKey, url, autoplay) {
        console.log(targetSourceKey, url)
        if (!checkSourcesExist(targetSourceKey)) return;

        stop(targetSourceKey);
        if (url == null) return;

        fetch(url)
            .then(data => data.arrayBuffer())
            .then(buffer => {
                if (buffer.byteLength > 5000) {
                    sources[targetSourceKey].arrayBuffer = buffer;
                    if (autoplay) initSound(targetSourceKey);
                }
            }).catch(error => console.error("[AudioContext] loadAudioFile fetch failed.", error));
    }

    document.addEventListener("click", initAudioContext)
    return {start, stop, loadAudioFile, initSound, isSourceEnded, ...sourcesMap}
})()