import { controlStore } from '@/store'
import { stopPropagation } from '@/utils'
import { FunctionComponent, useMemo } from 'react'
import { useStore } from 'reto'

const Yoozle: FunctionComponent<{}> = () => {
    return (
        <div className="yoozle-container">
            <div className="yoozle-title">
                <span>
                    <span className="yoozle-gl-blue">Y</span>
                    <span className="yoozle-gl-red">o</span>
                    <span className="yoozle-gl-yellow">o</span>
                    <span className="yoozle-gl-blue">z</span>
                    <span className="yoozle-gl-green">l</span>
                    <span className="yoozle-gl-red yoozle-e-rotate">e</span>
                </span>
            </div>
            <div className="yoozle-search">
                <input className="yoozle-search-bar" type="text" defaultValue="" />
                <div className="yoozle-search-buttons">
                    <input className="yoozle-btn" type="submit" value="Yoozle Search" />
                    <input className="yoozle-btn" type="submit" value="I'm Feeling Lucky" />
                </div>
            </div>
        </div>
    )
}
export const PanicOverlay: FunctionComponent<{}> = () => {
    const { control } = useStore(controlStore, ({ control }) => [control.panicOverlayVisible])

    return (
        <div onClick={stopPropagation} id="panic-overlay" style={{ display: control.panicOverlayVisible ? 'block' : 'none' }}>
            {useMemo(() => (
                <Yoozle />
            ), [])}
        </div>
    )
}