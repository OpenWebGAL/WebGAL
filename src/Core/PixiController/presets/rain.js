import * as PIXI from "pixi.js";
import {currentPIXI} from "../../StoreControl/StoreControl";

const pixiRain = (rainSpeed) => {
    const app = currentPIXI['app'];
    const container = new PIXI.Container();
    app.stage.addChild(container);
    const texture = PIXI.Texture.from('./game/tex/rain_min.png');
    // 创建网格
    for (let i = 0; i < 400; i++) {
        const bunny = new PIXI.Sprite(texture);
        bunny.anchor.set(0.5);
        bunny.x = (i % 20) * 300;
        bunny.y = Math.floor(i / 20) * 300;
        container.addChild(bunny);
    }
    // 将容器移到中心
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;
    //调整缩放
    container.scale.x = 0.7;
    container.scale.y = 0.7;
    container.rotation = -0.2;
    // 监听动画更新
    app.ticker.add((delta) => {
        // 控制下雨速度
        container.y += rainSpeed * delta;
        if (container.y >= 2000) {
            container.y = app.screen.height / 2;
        }
    });
}

export default pixiRain;