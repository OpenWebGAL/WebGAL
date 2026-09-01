import { sceneTextPreProcess } from "../src/sceneTextPreProcessor";
import SceneParser from "../src/index";
import { ADD_NEXT_ARG_LIST, SCRIPT_CONFIG } from "../src/config/scriptConfig";
import { expect, test } from "vitest";
import * as fsp from 'fs/promises';

const parser = new SceneParser(() => { }, (fileName) => fileName, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

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

test("parser-multiline-marks-line-range", async () => {
    const testScene = `changeFigure:a.png -left
  -next
  -id=id1
saySomething`;

    const { sentenceList } = parser.parse(testScene, 'test', 'test');

    // 折叠后的参数全部落在首行语句上
    expect(sentenceList[0].args).toEqual([
        { key: 'left', value: true },
        { key: 'next', value: true },
        { key: 'id', value: 'id1' },
    ]);
    // 首行语句的行范围覆盖被折叠掉的两条续行
    expect(sentenceList[0]).toMatchObject({ startLine: 0, endLine: 2, isLineBreakHolder: false });
    expect(sentenceList[1]).toMatchObject({ startLine: 1, endLine: 1, isLineBreakHolder: true });
    expect(sentenceList[2]).toMatchObject({ startLine: 2, endLine: 2, isLineBreakHolder: true });
    // 续行之后的语句回到单行
    expect(sentenceList[3]).toMatchObject({ startLine: 3, endLine: 3, isLineBreakHolder: false });
});

/**
 * 行数守恒是存档兼容性的护栏：引擎的 currentSentenceId / continueLine 存的是
 * 语句 index，只要「语句数 == 文件行数」成立，多行支持就不会让旧存档错位。
 */
test("parser-multiline-preserves-line-count", async () => {
    const sceneText = (await fsp.readFile('test/test-resources/long-script.txt'))
        .toString()
        .replaceAll('\r', '');

    const { sentenceList } = parser.parse(sceneText, 'test', 'test');

    expect(sentenceList.length).toBe(sceneText.split('\n').length);
});

/**
 * 折叠序列的首行是空行时，曾经整条序列会被丢掉，导致预处理后行数变少、
 * 「语句 index == 文件行号」失效，进而让存档错位。
 */
test("parser-multiline-empty-first-line-keeps-line-count", async () => {
    const testScene = `A;

  -next
B;`;

    expect(sceneTextPreProcess(testScene).split('\n')).toHaveLength(4);
    expect(parser.parse(testScene, 'test', 'test').sentenceList).toHaveLength(4);
});
