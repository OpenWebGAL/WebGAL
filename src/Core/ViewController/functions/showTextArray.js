import {getRuntime} from "../../StoreControl/StoreControl";
import ReactDOM from "react-dom";
import {nextSentenceProcessor} from "../../WG_core";

const showTextArary = (textArray) => {

    //设置文字渐显为当前不在渐显
    getRuntime().showingText = false;
    //清空当前文本框内容
    ReactDOM.render(<span> </span>, document.getElementById('SceneText'));

    //当前文本内容
    let elementArray = [];
    // i代表已经显示完的字数
    let i = 0;

    //开始渐显，每textShowWaitTime秒运行一次渐显函数
    clearInterval(interval);
    var interval = setInterval(showSingle, getRuntime().textShowWaitTime);
    getRuntime().showingText = true;//标记文字正在渐显


    // 渐显函数
    function showSingle() {

        // 如果此时不在渐显，则可以判定用户已经点击文本框，此时显示所有内容
        if (!getRuntime().showingText) {
            let textFull = '';
            for (let j = 0; j < textArray.length; j++) {
                textFull = textFull + textArray[j];
            }
            ReactDOM.render(<div>{textFull}</div>, document.getElementById('SceneText'));
            // 如果自动模式开，则将i设置到结束位置，但是不超过自动模式等待时间
            if (getRuntime().auto === 1) {
                if (i < textArray.length + 1) {
                    i = textArray.length + 1;
                } else {
                    i = i + 1;
                }
            } else {
                //直接设置i标记到等待时间结束
                i = textArray.length + 1 + (getRuntime().autoWaitTime / 35);
            }
            //正常渐显：每次向文本框内加一个字
        } else {
            let tempElement = <span key={i} className='singleWord'>{textArray[i]}</span>
            elementArray.push(tempElement);
            ReactDOM.render(<div>{elementArray}</div>, document.getElementById('SceneText'));
            i = i + 1;
        }


        //------以下代码是语句渐显完后的进一步操作------

        //渐显完成，且不在自动模式，此时先打上标记，表示文字显示结束。
        if (i > textArray.length && getRuntime().auto !== 1) {
            getRuntime().showingText = false;
        }

        //渐显完成，且等待时间超过自动模式设置的超时时间
        if (i > textArray.length + (getRuntime().autoWaitTime / 35)) {
            if (getRuntime().auto === 1) {
                // 自动模式，等待语音结束后再结束
                if (document.getElementById('currentVocal') && getRuntime().fast === 0) {
                    if (document.getElementById('currentVocal').ended) {
                        clearInterval(interval);
                        getRuntime().showingText = false;
                        nextSentenceProcessor();
                    }
                    // 快速模式，忽略语音是否结束，继续下一句
                } else {
                    clearInterval(interval);
                    getRuntime().showingText = false;
                    nextSentenceProcessor();
                }
                // 正常模式，标记文字渐显完成，停止渐显函数
            } else {
                getRuntime().showingText = false;
                clearInterval(interval);
            }

        }
    }
}

export default showTextArary;