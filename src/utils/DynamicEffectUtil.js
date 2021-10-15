import * as ReactDOM from "react-dom";
import store, {act, actions} from "../store/store";

let DynamicEffectUtil = (function DynamicEffectUtil() {

    /**
     * 逐字渲染
     * @param {string} text 需要渲染的内容
     * @param {Element} targetElement 目标容器
     * @returns {Object|?} 返回定时循环对象
     */
    function showTextArray(text, targetElement) {
        if (typeof text !== 'string' || text === '') return
        act(actions.SET_TEMP_SHOWING_TEXT, true)

        let textArray = text.split('')
        let fontCount = textArray.length

        let singleLetterTime = 50
        let temp = []
        let index = 0

        let interval = setInterval(() => {
            temp.push(<span key={index} className="singleWord">{text[index++]}</span>)

            if (index >= fontCount || !store.getState()["tempState"].showingText) {
                temp = text
                clearInterval(interval)
                act(actions.SET_TEMP_SHOWING_TEXT, false)
            }

            ReactDOM.render(<div>{temp}</div>, targetElement)
        }, singleLetterTime)
        return interval
    }

    return {showTextArray}
})()

export default DynamicEffectUtil