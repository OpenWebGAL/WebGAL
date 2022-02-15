import * as PIXI from "pixi.js";
import {currentPIXI} from "../../StoreControl/StoreControl";

const pixiRain2 = (rainSpeed,number) => {
    //动画参数
    //设置缩放的系数
    const scalePreset = 0.3


    const app = currentPIXI['app'];
    const container = new PIXI.Container();
    app.stage.addChild(container);
    //创建纹理
    const texture = PIXI.Texture.from('./game/tex/raindrop.png');
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
        for (let i = 0; i < number; i++) {
            //创建对象
            const bunny = new PIXI.Sprite(texture);
            // 随机雨点大小
            let scaleRand = Math.random();
            if (scaleRand <= 0.5) {
                scaleRand = 0.5;
            }
            bunny.scale.x = scalePreset * scaleRand;
            bunny.scale.y = scalePreset * scaleRand;
            //设置锚点
            bunny.anchor.set(0.5);
            //随机雪花位置
            bunny.x = Math.random() * stageWidth - 0.5 * stageWidth;
            bunny.y = 0 - 0.5 * stageHeight;
            bunny['dropSpeed'] = Math.random() * 2;
            bunny['acc'] = Math.random();
            bunny['alpha'] = Math.random();
            if(bunny['alpha']>=0.5){
                bunny["alpha"] = 0.5
            }
            if(bunny['alpha']<= 0.2){
                bunny['alpha'] = 0.2;
            }
            container.addChild(bunny);
            //控制每片雨点
            bunnyList.push(bunny);
        }
        //雨点落下
        for (const e of bunnyList) {
            e['dropSpeed'] = e['acc'] *0.01 + e['dropSpeed'];
            e.y += delta * rainSpeed * e['dropSpeed'] * 1.1 + 3;
        }
        //控制同屏雨点数
        if (bunnyList.length >= 2500) {
            bunnyList.unshift();
            container.removeChild(container.children[0]);
        }
    });
}


export default pixiRain2;