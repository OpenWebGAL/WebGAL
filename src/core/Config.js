const Config = (function () {
    let configTemplate = {
        playSpeedMap: {
            slow: 75,
            medium: 50,
            fast: 30
        },
        fontSizeMap: {
            small: '16px',
            medium: '24px',
            large: '32px'
        },
        GameInfo: {
            Game_name: 'WebGAL Demo',
            Game_key: 'WG_default',
            Title_img: 'Title2.png',
            Title_bgm: '夏影.mp3'
        }
    }

    function getGameInfo(url) {
        fetch(url)
            .then(data => data.text())
            .then(text => {
                let textList = text.split('\n');

                textList.forEach(single => {
                    let result = single.split(";")[0].split(":")

                    configTemplate.GameInfo[result[0]] = result[1]
                })
            })
    }

    getGameInfo('game/config.txt')

    return {...configTemplate, getGameInfo}
})()

export default Config