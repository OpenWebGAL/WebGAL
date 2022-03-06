import { sceneStore } from '@/store'
import { showText } from '@/utils'
import { FunctionComponent, useContext, useEffect, useState } from 'react'
import { useStore } from 'reto'

const TextPreview: FunctionComponent<{ text: string }> = ({ text }) => {
    const textArray = text.split('')
    const { setting } = useStore(sceneStore, ({ setting }) => [...Object.values(setting)])
    const textContent = showText(textArray, setting.playSpeed)()
    const [textVisible, setTextVisible] = useState(false)
    useEffect(() => {
        const t = setInterval(() => {
            setTextVisible(false)
            setTextVisible(true)
        }, setting.playSpeed * textArray.length + setting.autoPlayWaitTime)
        return () => {
            clearInterval(t)
        }
    }, [setting.playSpeed])
    return (
        <div style={{ fontSize: setting.fontSize }}>
            {
                textVisible ? textContent : ''
            }
        </div>
    )
}
export default TextPreview