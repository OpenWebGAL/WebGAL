import {getRuntime} from "../../StoreControl/StoreControl";
import ReactDOM from "react-dom";
import React from "react";

const showTextPreview = (text) => {
    getRuntime().onTextPreview = getRuntime().onTextPreview + 1;
    let textArray = text.split("");
    ReactDOM.render(<span> </span>, document.getElementById('previewDiv'));
    let elementArray = [];
    let i = 0;
    // eslint-disable-next-line no-use-before-define
    clearInterval(interval2);
    var interval2 = setInterval(showSingle, getRuntime().textShowWaitTime);

    function showSingle() {
        if (getRuntime().onTextPreview > 1) {
            getRuntime().onTextPreview = getRuntime().onTextPreview - 1;
            clearInterval(interval2);
            return;
        }
        let tempElement = <span key={i} className='singleWord'>{textArray[i]}</span>
        elementArray.push(tempElement);
        ReactDOM.render(<div>{elementArray}</div>, document.getElementById('previewDiv'));
        i = i + 1;
        if (i > textArray.length + (1000 / 35)) {
            clearInterval(interval2);
            interval2 = setInterval(showSingle, getRuntime().textShowWaitTime);
            i = 0;
            elementArray = [];
        }
    }
}

export default showTextPreview;