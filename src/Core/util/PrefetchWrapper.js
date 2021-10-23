'use strict';

// import { getStatus } from '../StoreControl/StoreControl';



/**
 * 解析场景中用到的资源
 * @param {String} sceneText 场景文本
 * @param {{sceneUrl: String, startLine: Number, endLine: Number, urgentLine: Number}} options <br/>
 *      `sceneUrl` 场景文件 URL，以去自引用<br/>
 *      `startLine` 开始解析的自然行（从 1 开始，含）<br/>
 *      `urgentLine` 最大急用行数<br/>
 *      `maxLine` 最大解析行数<br/>
 * @returns {{all: Set.<String>, map: Map.<String, Array.<String>>, urgent: Array.<String>}} 去重、去自引用的资源<br/>
 *      `all` 全部；常用于存放剔除已缓存后的所需资源<br/>
 *      `map` 分类后；键: `background`, `bgm`, `figure`, `scene`, `vocal`<br/>
 *      `urgent` 急用<br/>
 */
function extractAssetUrl(sceneText, { sceneUrl = '', startLine = 1, urgentLine = 8, maxLine = Number.POSITIVE_INFINITY } = {}) {
    /** @type {Set.<String>} */
    const assetAll = new Set();

    /** @type {Map.<String, Array.<String>>} */
    const assetMap = new Map();
    ['background', 'bgm', 'figure', 'scene', 'vocal'].forEach((key) => {
        assetMap.set(key, []);
    });

    /** @type {Array.<String>} */
    const assetUrgent = [];

    /** @param {String} dialogue */
    const extractVocal = (dialogue) => {
        const vocalPrefix = 'vocal-';
        const vocal = dialogue.split(',', 1)[0];
        if (vocal.length < dialogue.length && vocal.length > vocalPrefix.length && vocal.startsWith(vocalPrefix))
            return vocal.substring(vocalPrefix.length);
        return '';
    };

    /**
     * @param {String} filetype
     * @param {String} filename
     * @param {Number} currLineIdx start from 0
     */
    const addToAssets = (filetype, filename, currLineIdx) => {
        const url = `game/${filetype}/${filename}`;
        if (assetAll.has(url) || (filetype === 'scene' && url === sceneUrl))
            return false;
        assetAll.add(url);
        assetMap.get(filetype).push(url);
        if (currLineIdx + 1 - startLine < urgentLine)
            assetUrgent.push(url);
        return true;
    };

    const lines = sceneText.split('\n');
    for (const [lineIdx, lineData] of lines.entries()) {
        if (lineIdx + 1 - startLine >= maxLine)
            break;

        if (lineIdx + 1 < startLine)
            continue;

        const tokens = lineData.split(';', 1)[0];
        if (!tokens)
            continue;

        const cmdOrDlg = tokens.split(':', 1)[0];
        if (cmdOrDlg.length < tokens.length) {
            // `cmdOrDlg` is command (or name of character)

            const argOrDlg = tokens.substring(cmdOrDlg.length + 1);
            if (!argOrDlg)
                continue;

            switch (cmdOrDlg) {
                // if hit, then `cmdOrDlg` is command and `argOrDlg` is argument

                case 'changeBG':
                case 'changeBG_next':
                    if (argOrDlg !== 'none')
                        addToAssets('background', argOrDlg, lineIdx);
                    break;

                case 'changeP':
                case 'changeP_left':
                case 'changeP_right':
                case 'changeP_next':
                case 'changeP_left_next':
                case 'changeP_right_next':
                    if (argOrDlg !== 'none')
                        addToAssets('figure', argOrDlg, lineIdx);
                    break;

                case 'changeScene':
                    addToAssets('scene', argOrDlg, lineIdx);
                    // DO NOT return, the command may be skipped
                    break;

                case 'choose': {
                    const choices = argOrDlg.trim().slice(1, -1).split(',');
                    for (const choice of choices) {
                        const args = choice.split(':');
                        if (args.length === 2 && args[1])
                            addToAssets('scene', args[1], lineIdx);
                    }
                }
                    break;

                case 'bgm':
                    addToAssets('bgm', argOrDlg, lineIdx);
                    break;

                // ignore these commands
                case 'intro':
                case 'label':
                case 'jump_label':
                case 'choose_label':
                    break;

                // `cmdOrDlg` is name of character, `argOrDlg` is dialogue
                default: {
                    const vocal = extractVocal(argOrDlg);
                    if (vocal)
                        addToAssets('vocal', vocal, lineIdx);
                }
                    break;
            }
        }
        else {
            // `cmdOrDlg` is continued dialogue
            const vocal = extractVocal(cmdOrDlg);
            if (vocal)
                addToAssets('vocal', vocal, lineIdx);
        }
    }

    return { all: assetAll, map: assetMap, urgent: assetUrgent };
}



export { extractAssetUrl }
