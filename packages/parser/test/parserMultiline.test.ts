import { sceneTextPreProcess } from "../src/sceneTextPreProcessor";
import { expect, test } from "vitest";

test("parser-multiline-basic", async () => {
    const testScene = `changeFigure:a.png -left
  -next
  -id=id1

saySomething`;
    const expected = `changeFigure:a.png -left -next -id=id1
;_WEBGAL_LINE_BREAK_  -next
;_WEBGAL_LINE_BREAK_  -id=id1

saySomething`;

    const preprocessedScene = sceneTextPreProcess(testScene);
    expect(preprocessedScene).toEqual(expected);
});


test("parser-multiline-disable-when-encounter-concat-1", async () => {
    const testScene = `intro:aaa
  |bbb -concat
`;
    const expected = `intro:aaa
  |bbb -concat
`;

    const preprocessedScene = sceneTextPreProcess(testScene);
    expect(preprocessedScene).toEqual(expected);
});


test("parser-multiline-disable-when-encounter-concat-2", async () => {
    const testScene = `intro:aaa
  |bbb
  |ccc -concat
`;
    const expected = `intro:aaa|bbb
;_WEBGAL_LINE_BREAK_  |bbb
  |ccc -concat
`;

    const preprocessedScene = sceneTextPreProcess(testScene);
    expect(preprocessedScene).toEqual(expected);
});

test("parser-multiline-user-force-allow-multiline-in-concat", async () => {
    const testScene = String.raw`intro:aaa\
|bbb\
|ccc -concat
`;
    const expected = `intro:aaa|bbb|ccc -concat
;_WEBGAL_LINE_BREAK_|bbb
;_WEBGAL_LINE_BREAK_|ccc -concat
`;

    const preprocessedScene = sceneTextPreProcess(testScene);
    expect(preprocessedScene).toEqual(expected);
});

test("parser-multiline-others-same-as-before", async () => {
    const testScene = `听起来是不是非常吸引人？ -v4.wav;
changeFigure:none -right -next;
setAnimation:l2c -target=fig-left -next;
WebGAL 引擎也具有动画系统和特效系统，使用 WebGAL 开发的游戏可以拥有很好的表现效果。 -v5.wav;
`;

    const preprocessedScene = sceneTextPreProcess(testScene);
    expect(preprocessedScene).toEqual(testScene);
});

test("parser-multiline-full", async () => {
    const testScene = `changeFigure:a.png -left
  -next
  -id=id1

intro:aaa
  |bbb|ccc
  |ddd
  -next;

; WebGAL 引擎会默认读取 start.txt 作为初始场景，因此请不要删除，并在初始场景内跳转到其他场景
bgm:s_Title.mp3;
unlockBgm:s_Title.mp3 -name=雲を追いかけて;
intro:你好
|欢迎来到 WebGAL 的世界;
changeBg:bg.webp -next;
unlockCg:bg.webp -name=良夜; // 解锁CG并赋予名称
changeFigure:stand.webp -left -next;
setAnimation:enter-from-left
  -target=fig-left -next;
WebGAL:欢迎使用 WebGAL！这是一款全新的网页端视觉小说引擎。
  -v1.wav;
changeFigure:stand2.webp
  -right -next;
WebGAL 是使用 Web 技术开发的引擎，因此在网页端有良好的表现。 -v2.wav;
由于这个特性，如果你将 WebGAL 部署到服务器或网页托管平台上，玩家只需要一串链接就可以开始游玩！ -v3.wav;
setAnimation:move-front-and-back
  -target=fig-left
  -next;

听起来是不是非常吸引人？ -v4.wav;
changeFigure:none -right -next;
setAnimation:l2c -target=fig-left -next;
WebGAL 引擎也具有动画系统和特效系统，使用 WebGAL 开发的游戏可以拥有很好的表现效果。
  -v5.wav;
`;

    const expected = `changeFigure:a.png -left -next -id=id1
;_WEBGAL_LINE_BREAK_  -next
;_WEBGAL_LINE_BREAK_  -id=id1

intro:aaa|bbb|ccc|ddd -next;
;_WEBGAL_LINE_BREAK_  |bbb|ccc
;_WEBGAL_LINE_BREAK_  |ddd
;_WEBGAL_LINE_BREAK_  -next;

; WebGAL 引擎会默认读取 start.txt 作为初始场景，因此请不要删除，并在初始场景内跳转到其他场景
bgm:s_Title.mp3;
unlockBgm:s_Title.mp3 -name=雲を追いかけて;
intro:你好
|欢迎来到 WebGAL 的世界;
changeBg:bg.webp -next;
unlockCg:bg.webp -name=良夜; // 解锁CG并赋予名称
changeFigure:stand.webp -left -next;
setAnimation:enter-from-left -target=fig-left -next;
;_WEBGAL_LINE_BREAK_  -target=fig-left -next;
WebGAL:欢迎使用 WebGAL！这是一款全新的网页端视觉小说引擎。 -v1.wav;
;_WEBGAL_LINE_BREAK_  -v1.wav;
changeFigure:stand2.webp -right -next;
;_WEBGAL_LINE_BREAK_  -right -next;
WebGAL 是使用 Web 技术开发的引擎，因此在网页端有良好的表现。 -v2.wav;
由于这个特性，如果你将 WebGAL 部署到服务器或网页托管平台上，玩家只需要一串链接就可以开始游玩！ -v3.wav;
setAnimation:move-front-and-back -target=fig-left -next;
;_WEBGAL_LINE_BREAK_  -target=fig-left
;_WEBGAL_LINE_BREAK_  -next;

听起来是不是非常吸引人？ -v4.wav;
changeFigure:none -right -next;
setAnimation:l2c -target=fig-left -next;
WebGAL 引擎也具有动画系统和特效系统，使用 WebGAL 开发的游戏可以拥有很好的表现效果。 -v5.wav;
;_WEBGAL_LINE_BREAK_  -v5.wav;
`;

    const preprocessedScene = sceneTextPreProcess(testScene);
    expect(preprocessedScene).toEqual(expected);
});
