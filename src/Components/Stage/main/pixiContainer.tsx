import { FunctionComponent, useCallback, useEffect, useImperativeHandle, useRef } from "react";
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

let app = new PIXI.Application({
    backgroundAlpha: 0,
    autoDensity: true
});
export const Pixi: FunctionComponent<{}> = () => {
    const { pixiRef, scene } = useStore(sceneStore, ({ scene }) => [scene.pixiPerformList])
    const pixiContainer = useRef<HTMLDivElement | null>(null)
    const pixiInit = useCallback(
        () => {
            //清空原节点
            app.stage.removeChildren()
            pixiContainer.current!.innerHTML = ''
            pixiContainer.current!.appendChild(app.view)

            app.renderer.view.style.position = "absolute";
            app.renderer.view.style.display = "block";
            const root = document.getElementById('root')!
            app.renderer.resize(root.clientWidth, root.clientHeight);
            app.renderer.view.style.zIndex = '2';
            runtime.pixiApp = app
        },
        [],
    )

    const pixiPerform = useCallback(
        ({ performType, option = {} }: PixiPerform) => {
            presetMap[performType](option)
        },
        [],
    )

    useEffect(() => {
        pixiInit()
        scene.pixiPerformList.length && pixiPerform(scene.pixiPerformList[0])
    }, [scene.pixiPerformList])

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