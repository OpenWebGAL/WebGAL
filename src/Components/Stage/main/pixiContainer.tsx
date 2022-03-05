import { FunctionComponent, useImperativeHandle, useRef } from "react";
import * as PIXI from 'pixi.js';
import { useStore } from "reto";
import { runtime, sceneStore } from "@/store";
import type { PixiPerform } from "@/types";
import { pixiRain2, pixiSnow } from "@/utils";
export type PixiRef = {
    pixiInit: () => void
    pixiPerform: ({ performType, option }: PixiPerform) => void
}

export const presetMap = {
    snow: (o: PixiPerform['option']) => { pixiSnow(o) },
    rain: (o: PixiPerform['option']) => { pixiRain2(o) }
}

export type PerformType = keyof typeof presetMap

export const Pixi: FunctionComponent<{}> = () => {
    const { pixiRef } = useStore(sceneStore, () => [])
    const pixiContainer = useRef<HTMLDivElement | null>(null)
    useImperativeHandle(pixiRef, () => {
        return {
            pixiInit: () => {
                let app = new PIXI.Application({
                    backgroundAlpha: 0,
                    autoDensity: true
                });
                //清空原节点
                pixiContainer.current!.innerHTML = ''
                pixiContainer.current!.appendChild(app.view)

                app.renderer.view.style.position = "absolute";
                app.renderer.view.style.display = "block";
                const root = document.getElementById('root')!
                app.renderer.resize(root.clientWidth, root.clientHeight);
                app.renderer.view.style.zIndex = '2';
                runtime.pixiApp = app
            },
            pixiPerform: ({ performType, option = {} }: PixiPerform) => {
                presetMap[performType](option)
            }
        }
    }, [])
    return (
        <div ref={pixiContainer} id='pixiContianer'>
        </div>
    )
}