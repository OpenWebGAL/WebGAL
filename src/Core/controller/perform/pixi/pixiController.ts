import * as PIXI from "pixi.js";
import {runtime_gamePlay} from "@/Core/runtime/gamePlay";

export const pixiController = (active: boolean) => {
    if (active) {
        let app = new PIXI.Application({
            backgroundAlpha: 0
        });
        // 清空原节点
        const pixiContainer = document.getElementById('pixiContianer');
        if (pixiContainer) {
            pixiContainer.innerHTML = '';
            pixiContainer.appendChild(app.view);
        }

        app.renderer.view.style.position = "absolute";
        app.renderer.view.style.display = "block";
        // @ts-ignore
        app.renderer.autoResize = true;
        const appRoot = document.getElementById('root');
        if (appRoot) {
            app.renderer.resize(appRoot.clientWidth, appRoot.clientHeight);
        }
        app.renderer.view.style.zIndex = '5';
        runtime_gamePlay.currentPixi = app;
    } else {
        // 清空原节点
        const pixiContainer = document.getElementById('pixiContianer');
        if (pixiContainer) {
            pixiContainer.innerHTML = '';
        }
    }
};
