import { IScene } from '../controller/scene/sceneInterface';
import { logger } from '../util/etc/logger';
import { assetsPrefetcher } from '@/Core/util/prefetcher/assetsPrefetcher';
import { assetSetter } from '@/Core/util/gameAssetsAccess/assetSetter';
import { ADD_NEXT_ARG_LIST, SCRIPT_CONFIG } from '@/Core/config/scriptConfig';
import SceneParser from 'webgal-parser';

/**
 * 场景解析器
 * @param rawScene 原始场景
 * @param sceneName 场景名称
 * @param sceneUrl 场景url
 * @return {IScene} 解析后的场景
 */
export const WebgalParser = new SceneParser(assetsPrefetcher, assetSetter, ADD_NEXT_ARG_LIST, SCRIPT_CONFIG);

export const sceneParser = (rawScene: string, sceneName: string, sceneUrl: string): IScene => {
  const parsedScene = WebgalParser.parse(rawScene, sceneName, sceneUrl);
  logger.info(`解析场景：${sceneName}，数据为：`, parsedScene);
  return parsedScene;
};
