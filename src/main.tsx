import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import {resize} from './Core/util/resize'

ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.getElementById('root'), () => {
        //在调整窗口大小时重新计算宽高，设计稿按照 1600*900。
        setTimeout(resize, 100)
        resize();
        window.onresize = resize;
        document.onkeydown = function (event) {
            const e = event || window.event || arguments.callee.caller.arguments[0];
            if (e && e.keyCode == 122) {
                setTimeout(() => {
                    resize();
                }, 100);
            }
        };
    }
)
