import * as ReactDOM from "react-dom";

/**
 *  逐字显示工具类
 *
 */
const ShowTextArrayUtil = (function () {

    const renderMap = {}

    function getRenderItem(element) {
        let key = element.localName + "#" + element.id
        return renderMap[key]
    }

    function setInRenderMap(element, text, showTime, interval) {
        let key = element.localName + "#" + element.id
        renderMap[key] = {text: text, showTime: showTime, interval: interval}
    }

    /**
     * 逐字渲染
     * @param {string} text 需要渲染的内容
     * @param {Element} targetElement 目标容器
     * @param {number|undefined?} showTime 单字所需渲染的时长
     * @param {Function?} checkEnd 获取提前结束的标志
     * @param {Function?} onStart 开始时的周期函数
     * @param {Function?} onEnd   结束时的周期函数
     * @returns {Object|?} 返回定时循环对象
     */
    function showIn(text, targetElement, showTime = 50, checkEnd, onStart, onEnd) {

        if (getRenderItem(targetElement) !== undefined) {
            clearInterval(getRenderItem(targetElement).interval)
        }

        if (typeof text !== 'string' || text === '') {
            ReactDOM.render(<div>{text}</div>, targetElement)
            return
        }
        if (onStart !== null && typeof onStart == 'function') onStart()

        let temp = []
        let index = 0

        let interval = setInterval(() => {
            temp.push(<span key={index} className="singleWord">{text[index++]}</span>)

            let isEnd = false
            if (checkEnd != null && typeof onStart == 'function')
                isEnd = checkEnd()

            if (index >= text.length || isEnd) {
                temp = text
                clearInterval(interval)
                if (onEnd !== null && typeof onEnd == 'function') onEnd()
            }

            ReactDOM.render(<div>{temp}</div>, targetElement)
        }, showTime)

        setInRenderMap(targetElement, text, showTime, interval)
    }

    return {showIn}
})()

export default ShowTextArrayUtil