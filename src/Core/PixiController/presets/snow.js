import * as PIXI from "pixi.js";
import {currentPIXI} from "../../StoreControl/StoreControl";

const pixiSnow = (snowSpeed) => {
    const app = currentPIXI['app'];
    const container = new PIXI.Container();
    app.stage.addChild(container);
    //创建纹理
    const texture = PIXI.Texture.from('./game/tex/snowFlake_min.png');
    // 将容器移到中心
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;
    //调整缩放
    container.scale.x = 1;
    container.scale.y = 1;
    // container.rotation = -0.2;
    const bunnyList = [];
    // 监听动画更新
    app.ticker.add((delta) => {
        //获取长宽，用于控制雪花出现位置
        const stageWidth = document.getElementById('ReactRoot').clientWidth;
        const stageHeight = document.getElementById('ReactRoot').clientHeight;
        //创建对象
        const bunny = new PIXI.Sprite(texture);
        // 随机雪花大小
        const scaleRand = Math.random() * 1.05;
        bunny.scale.x = 0.1 * scaleRand;
        bunny.scale.y = 0.1 * scaleRand;
        //设置锚点
        bunny.anchor.set(0.5);
        //随机雪花位置
        bunny.x = Math.random() * stageWidth - 0.5 * stageWidth;
        bunny.y = 0 - 0.5 * stageHeight;
        container.addChild(bunny);
        //控制每片雪花
        bunnyList.push(bunny);
        let count = 0;//用于判断雪花往左还是往右飘，是2的倍数则往左
        for (const e of bunnyList) {
            count++;
            e.y += delta * snowSpeed;
            const randomNumber = Math.random();
            const addX = count % 2 === 0;
            if (addX) {
                e.x += delta * randomNumber * 0.5;
                e.rotation += delta * randomNumber * 0.05;
            } else {
                e.x -= delta * randomNumber * 0.5;
                e.rotation -= delta * randomNumber * 0.05;
            }
        }
        //控制同屏雪花数
        if (bunnyList.length >= 400) {
            bunnyList.unshift();
            container.removeChild(container.children[0]);
        }
    });
}

export default pixiSnow;