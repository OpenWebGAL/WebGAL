import { expect, test } from 'vitest';

import { ADD_NEXT_ARG_LIST, SCRIPT_CONFIG } from '../src/config/scriptConfig';
import SceneParser from '../src/index';
import { IAsset } from '../src/interface/sceneInterface';

const SCENE = `changeBg:a.webp;
character:hello -vocal=b.mp3;
callScene:chapter.txt;`;

const identityAssetSetter = (fileName: string) => fileName;

test('省略 assetsPrefetcher 时资源与子场景都不收集', () => {
  const parser = new SceneParser(
    undefined,
    identityAssetSetter,
    ADD_NEXT_ARG_LIST,
    SCRIPT_CONFIG,
  );

  const result = parser.parse(SCENE, 'test', 'test');

  expect(result.sentenceList).toHaveLength(3);
  expect(result.assetsList).toEqual([]);
  expect(result.subSceneList).toEqual([]);
  expect(result.sentenceList.map((sentence) => sentence.sentenceAssets)).toEqual([
    [],
    [],
    [],
  ]);
  expect(result.sentenceList.map((sentence) => sentence.subScene)).toEqual([
    [],
    [],
    [],
  ]);
});

test('提供 assetsPrefetcher 时收集行为与之前一致', () => {
  let prefetched: IAsset[] = [];
  const parser = new SceneParser(
    (assetList) => {
      prefetched = assetList;
    },
    identityAssetSetter,
    ADD_NEXT_ARG_LIST,
    SCRIPT_CONFIG,
  );

  const result = parser.parse(SCENE, 'test', 'test');

  expect(result.assetsList.map((asset) => asset.url)).toEqual([
    'a.webp',
    'b.mp3',
  ]);
  expect(prefetched).toEqual(result.assetsList);
  expect(result.subSceneList).toEqual(['chapter.txt']);
  expect(result.sentenceList[1]?.sentenceAssets).toHaveLength(1);
  expect(result.sentenceList[2]?.subScene).toEqual(['chapter.txt']);
});

test('跳过资源收集不影响语句切分与行范围', () => {
  const multiLineScene = [
    'changeFigure:hero.png',
    '  -id=hero -left;',
    'say:next;',
  ].join('\n');

  const withAssets = new SceneParser(
    () => { },
    identityAssetSetter,
    ADD_NEXT_ARG_LIST,
    SCRIPT_CONFIG,
  ).parse(multiLineScene, 'test', 'test');
  const withoutAssets = new SceneParser(
    undefined,
    identityAssetSetter,
    ADD_NEXT_ARG_LIST,
    SCRIPT_CONFIG,
  ).parse(multiLineScene, 'test', 'test');

  const pickStructure = (scene: typeof withAssets) =>
    scene.sentenceList.map((sentence) => [
      sentence.command,
      sentence.content,
      sentence.startLine,
      sentence.endLine,
      sentence.args,
    ]);

  expect(pickStructure(withoutAssets)).toEqual(pickStructure(withAssets));
});
