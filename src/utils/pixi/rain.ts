import { runtime } from "@/store";
import * as PIXI from "pixi.js";
import type { Bunny } from "@/types";
import { getUrl } from "..";

export const pixiRain = ({ rainSpeed = 6 }) => {
    const app = runtime.pixiApp;
    if (!app) {
        return
    }
    const container = new PIXI.Container();
    app.stage.addChild(container);
    const texture = PIXI.Texture.from(getUrl('rain_2.png', 'tex'));
    // 创建网格
    for (let i = 0; i < 400; i++) {
        const bunny = new PIXI.Sprite(texture);
        bunny.anchor.set(0.5);
        bunny.x = (i % 20) * 900; //多少行
        bunny.y = Math.floor(i / 20) * 600; //多少列
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
    container.rotation = -0.1;
    // 监听动画更新
    app.ticker.add((delta: number) => {
        // 控制下雨速度
        container.y += rainSpeed * delta;
        if (container.y >= 2000) {
            container.y = app.screen.height / 2;
        }

        //设置透明度
        let randNum = Math.random() / 10;
        let upOrDown = Math.random() <= 0.5;
        if (upOrDown) {
            container.alpha = container.alpha + randNum;
        } else {
            container.alpha = container.alpha - randNum;
        }
        if (container.alpha > 1 || container.alpha <= 0.7) {
            container.alpha = 0.85;
        }

    });
}

export const pixiRain2 = ({ rainSpeed = 6, number = 10 }) => {
    //动画参数
    //设置缩放的系数
    const scalePreset = 0.3
    const app = runtime.pixiApp;
    if (!app) {
        return
    }
    const container = new PIXI.Container();
    app.stage.addChild(container);
    //创建纹理
    const texture = PIXI.Texture.from(getUrl('raindrop.png', 'tex'));
    // 将容器移到中心
    container.x = app.screen.width / 2;
    container.y = app.screen.height / 2;
    container.pivot.x = container.width / 2;
    container.pivot.y = container.height / 2;
    //调整缩放
    container.scale.x = 1;
    container.scale.y = 1;
    // container.rotation = -0.2;
    const bunnyList: Bunny[] = [];
    // 监听动画更新
    const root = document.getElementById('root')!
    app.ticker.add((delta) => {
        //获取长宽，用于控制雪花出现位置
        const stageWidth = root.clientWidth;
        const stageHeight = root.clientHeight;
        for (let i = 0; i < number; i++) {
            //创建对象
            const bunny: Bunny = {
                sprite: new PIXI.Sprite(texture),
                acc: 0,
                dropSpeed: 0
            };
            // 随机雨点大小
            let scaleRand = Math.random();
            if (scaleRand <= 0.5) {
                scaleRand = 0.5;
            }
            bunny.sprite.scale.x = scalePreset * scaleRand;
            bunny.sprite.scale.y = scalePreset * scaleRand;
            //设置锚点
            bunny.sprite.anchor.set(0.5);
            //随机雪花位置
            bunny.sprite.x = Math.random() * stageWidth - 0.5 * stageWidth;
            bunny.sprite.y = 0 - 0.5 * stageHeight;

            bunny['dropSpeed'] = Math.random() * 2;
            bunny['acc'] = Math.random();
            const alpha = Math.random();
            if (alpha >= 0.5) {
                bunny.sprite["alpha"] = 0.5
            }
            if (alpha <= 0.2) {
                bunny.sprite['alpha'] = 0.2;
            }
            container.addChild(bunny.sprite);
            //控制每片雨点
            bunnyList.push(bunny);
        }
        //雨点落下
        for (const e of bunnyList) {
            e['dropSpeed'] = e['acc'] * 0.01 + e['dropSpeed'];
            e.sprite.y += delta * rainSpeed * e['dropSpeed'] * 1.1 + 3;
        }
        //控制同屏雨点数
        if (bunnyList.length >= 2500) {
            bunnyList.unshift();
            container.removeChild(container.children[0]);
        }
    });
}