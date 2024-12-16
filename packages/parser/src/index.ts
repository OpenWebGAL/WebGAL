import * as p from './parser';
import { configParser, WebgalConfig } from './configParser/configParser';
import { commandType, IAsset } from "./interface/sceneInterface";
import { fileType } from "./interface/assets";
import { SyntaxError as parserSyntaxError } from './parser';
import { contentParser } from './scriptParser/contentParser';
import { assetsScanner } from './scriptParser/assetsScanner';
import { subSceneScanner } from './scriptParser/subSceneScanner';
import { uniqWith } from 'lodash';
import { IWebGALStyleObj, scss2cssinjsParser } from './styleParser';
export { SyntaxError as parserSyntaxError } from './parser';
import {
  ADD_NEXT_ARG_LIST,
  SCRIPT_CONFIG,
  ConfigMap,
  ConfigItem,
} from './config/scriptConfig';
import { sceneParser } from './sceneParser';

export class NewSceneParser {

    private readonly assetsPrefetcher;
    private readonly assetSetter;
    private readonly ADD_NEXT_ARG_LIST;
    private readonly SCRIPT_CONFIG;

    public constructor(assetsPrefetcher: ((assetList: Array<IAsset>) => void),
        assetSetter: (fileName: string, assetType: fileType) => string,
        ADD_NEXT_ARG_LIST: Array<number>, SCRIPT_CONFIG: Array<any>) {
        this.assetsPrefetcher = assetsPrefetcher;
        this.assetSetter = assetSetter;
        this.ADD_NEXT_ARG_LIST = ADD_NEXT_ARG_LIST;
        this.SCRIPT_CONFIG = SCRIPT_CONFIG;
    }

    public parse(rawScene: string, sceneName: string, sceneUrl: string) {
        let result;
        try {
            result = p.parse(rawScene);
        } catch (e) {
            throw parserSyntaxError(`ERROR: parsing scene "${rawScene}" error with ${e}`);
        }

        let assetsList: Array<IAsset> = []; // 场景资源列表
        let subSceneList: Array<string> = []; // 子场景列表

        // 开始资源的预加载
        assetsList = uniqWith(assetsList); // 去重
        this.assetsPrefetcher(assetsList);

        result.sentenceList.forEach((sentence) => {
            // 为了向后兼容性，我们单独抽取choose命令的原始语句
            if (sentence.command === commandType.choose) {
                const r = sentence.args.find(obj => obj.key === 'contentRawRange');
                sentence.content = rawScene.substring(r.value[0], r.value[1]);
            }

            // 将语句内容里的文件名转为相对或绝对路径
            const content = contentParser(sentence.content, sentence.command, this.assetSetter);

            // 扫描语句携带资源
            const sentenceAssets = assetsScanner(sentence.command, content, sentence.args);

            // 扫描语句携带子场景
            const subScene = subSceneScanner(sentence.command, content);

            // 添加至语句解析结果
            sentence.sentenceAssets = sentenceAssets;
            sentence.subScene = subScene;

            // 在这里解析出语句可能携带的资源和场景，合并到 assetsList 和 subSceneList
            assetsList = [...assetsList, ...sentenceAssets];
            subSceneList = [...subSceneList, ...subScene];
        });

        return result;
    }

    public parseConfig(configText: string) {
        return configParser(configText);
    }

    public stringifyConfig(config: WebgalConfig) {
        return config
            .reduce(
                (previousValue, curr) =>
                    (previousValue + `${curr.command}:${curr.args.join('|')}${curr.options.length <= 0 ? '' : curr.options.reduce((p, c) => (p + ' -' + c.key + '=' + c.value), '')};\n`),
                ''
            );
    }

    public parseScssToWebgalStyleObj(scssString: string): IWebGALStyleObj {
        return scss2cssinjsParser(scssString);
    }

}

export default class SceneParser {
  private readonly SCRIPT_CONFIG_MAP: ConfigMap;
  constructor(
    private readonly assetsPrefetcher: (assetList: IAsset[]) => void,
    private readonly assetSetter: (
      fileName: string,
      assetType: fileType,
    ) => string,
    private readonly ADD_NEXT_ARG_LIST: number[],
    SCRIPT_CONFIG_INPUT: ConfigItem[] | ConfigMap,
  ) {
    if (Array.isArray(SCRIPT_CONFIG_INPUT)) {
      this.SCRIPT_CONFIG_MAP = new Map();
      SCRIPT_CONFIG_INPUT.forEach((config) => {
        this.SCRIPT_CONFIG_MAP.set(config.scriptString, config);
      });
    } else {
      this.SCRIPT_CONFIG_MAP = SCRIPT_CONFIG_INPUT;
    }
  }
  /**
   * 解析场景
   * @param rawScene 原始场景
   * @param sceneName 场景名称
   * @param sceneUrl 场景url
   * @return 解析后的场景
   */
  parse(rawScene: string, sceneName: string, sceneUrl: string) {
    return sceneParser(
      rawScene,
      sceneName,
      sceneUrl,
      this.assetsPrefetcher,
      this.assetSetter,
      this.ADD_NEXT_ARG_LIST,
      this.SCRIPT_CONFIG_MAP,
    );
  }

  parseConfig(configText: string) {
    return configParser(configText);
  }

  stringifyConfig(config: WebgalConfig) {
    return config.reduce(
      (previousValue, curr) =>
        previousValue +
        `${curr.command}:${curr.args.join('|')}${
          curr.options.length <= 0
            ? ''
            : curr.options.reduce(
              (p, c) => p + ' -' + c.key + '=' + c.value,
              '',
            )
        };\n`,
      '',
    );
  }

  parseScssToWebgalStyleObj(scssString: string): IWebGALStyleObj{
    return scss2cssinjsParser(scssString);
  }

}

export { ADD_NEXT_ARG_LIST, SCRIPT_CONFIG };
