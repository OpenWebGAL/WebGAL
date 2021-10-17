import * as ReactDOM from "react-dom";
import Store, {act, actions} from "../store/Store";

let DynamicEffectUtil = (function DynamicEffectUtil() {

    /**
     * 逐字渲染
     * @param {string} text 需要渲染的内容
     * @param {Element} targetElement 目标容器
     * @param {number|undefined?} showTime
     * @returns {Object|?} 返回定时循环对象
     */
    function showTextArray(text, targetElement, showTime = 50) {
        if (typeof text !== 'string' || text === '') {
            ReactDOM.render(<div>{text}</div>, targetElement)
            return
        }
        act(actions.SET_TEMP_IS_SHOWING_TEXT, true)

        let textArray = text.split('')
        let fontCount = textArray.length

        let temp = []
        let index = 0

        let interval = setInterval(() => {
            temp.push(<span key={index} className="singleWord">{text[index++]}</span>)

            if (index >= fontCount || !Store.getState()["temp"].isShowingText) {
                temp = text
                clearInterval(interval)
                act(actions.SET_TEMP_IS_SHOWING_TEXT, false)
            }

            ReactDOM.render(<div>{temp}</div>, targetElement)
        }, showTime)
        return interval
    }

    return {showTextArray}
})()

export default DynamicEffectUtil