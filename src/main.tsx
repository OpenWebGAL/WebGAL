import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import {initializeScript} from "./Core/initializeScript";

ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.getElementById('root')
)

initializeScript();