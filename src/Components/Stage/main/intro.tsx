import { sceneStore } from '@/store'
import { exit, showParagraph, stopPropagation } from '@/utils'
import { FunctionComponent, useEffect } from 'react'
import { useStore } from 'reto'

export const IntroItem: FunctionComponent<{ intro: string }> = ({ intro }) => {
    const { setScene, setControl, setting, next } = useStore(sceneStore, ({ setting }) => [setting.autoPlayWaitTime])
    let textArray: string[]
    //优先使用|作为分隔符
    if (intro.match(/\|/)) {
        textArray = intro.split(/\|/);
    } else {
        textArray = intro.split(',');
    }
    useEffect(() => {
        let timeout: NodeJS.Timeout
        if (exit(intro)) {
            setControl(control => ({ ...control, bottomBoxVisible: false }))
            timeout = setTimeout(() => {
                setScene(scene => ({ ...scene, intro: '' }))
                next()
            }, (textArray.length + 1) * 1500 + 1250 + setting.autoPlayWaitTime)
        }
        return () => {
            timeout && clearTimeout(timeout)
        }
    }, [intro])

    return (
        <>
            {
                showParagraph(textArray)
            }
        </>
    )
}

export const Intro: FunctionComponent<{}> = () => {
    const { scene } = useStore(sceneStore, ({ scene }) => [scene.intro])
    return (
        <div id="intro" className="intro_styl" onClick={stopPropagation} style={{ display: scene.intro ? 'flex' : 'none' }}>
            <div id="textShowArea" className="textShowArea_styl">
                <IntroItem intro={scene.intro} />
            </div>
        </div>
    )
}