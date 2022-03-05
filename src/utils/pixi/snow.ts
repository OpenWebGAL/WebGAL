import { runtime } from "@/store";
import type { Bunny } from "@/types";
import * as PIXI from "pixi.js";
import { getUrl } from "..";

export const pixiSnow = ({ snowSpeed = 3 }) => {
    //动画参数
    //设置缩放的系数
    const scalePreset = 0.09
    const app = runtime.pixiApp;
    if (!app) {
        return
    }
    const container = new PIXI.Container();
    app.stage.addChild(container);
    //创建纹理
    const texture = PIXI.Texture.from(getUrl('snowFlake_min.png', 'tex'));
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
    const root = document.getElementById('root')!
    // 监听动画更新
    app.ticker.add((delta) => {
        //获取长宽，用于控制雪花出现位置
        const stageWidth = root.clientWidth;
        const stageHeight = root.clientHeight;
        //创建对象
        const bunny: Bunny = {
            sprite: new PIXI.Sprite(texture),
            acc: 0,
            dropSpeed: 0
        };
        // 随机雪花大小
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
        container.addChild(bunny.sprite);
        //控制每片雪花
        bunnyList.push(bunny);
        let count = 0;//用于判断雪花往左还是往右飘，是2的倍数则往左
        for (const e of bunnyList) {
            count++;
            const randomNumber = Math.random();
            e['dropSpeed'] = e['acc'] * 0.01 + e['dropSpeed'];
            e.sprite.y += delta * snowSpeed * e['dropSpeed'] * 0.3 + 0.7;
            const addX = count % 2 === 0;
            if (addX) {
                e.sprite.x += delta * randomNumber * 0.5;
                e.sprite.rotation += delta * randomNumber * 0.03;
            } else {
                e.sprite.x -= delta * randomNumber * 0.5;
                e.sprite.rotation -= delta * randomNumber * 0.03;
            }
        }
        //控制同屏雪花数
        if (bunnyList.length >= 500) {
            bunnyList.unshift();
            container.removeChild(container.children[0]);
        }
    });
}