import {useEffect, useState} from "react";
import './SettingsButtonSelector.css'

function SettingsButtonSelector(props) {
    // 初始化状态属性值
    const [buttonState, setButtonState] = useState(['', '', ''])

    // 切换选中的State
    function changeButtonState(index) {
        if (props.onSelect != null) props?.onSelect(index)

        let nowButtonState = ['', '', '']
        nowButtonState[index] = 'On'

        setButtonState(nowButtonState)
    }

    // 传入被选中的默认值
    useEffect(() => {
        if (props?.select != null) {
            let nowButtonState = ['', '', '']
            nowButtonState[props?.select] = 'On'

            setButtonState(nowButtonState)
        }
    }, [props.select, setButtonState])

    return (
        <span className="singleSettingItem">
                <span className="settingItemTitle">{props.title}</span>
                <span className={'settingItemButton' + buttonState[0]} onClick={() => {
                    changeButtonState(0)
                }}>{props.selection[0]}</span>
                <span className={'settingItemButton' + buttonState[1]} onClick={() => {
                    changeButtonState(1)
                }}>{props.selection[1]}</span>
                <span className={'settingItemButton' + buttonState[2]} onClick={() => {
                    changeButtonState(2)
                }}>{props.selection[2]}</span>
            </span>
    );
}

SettingsButtonSelector.defaultProps = {
    selection: ["小", "中", "大"],
    title: "选择器",
    onSelect: () => {
    }
}

export default SettingsButtonSelector