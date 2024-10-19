import {
  ADD_NEXT_ARG_LIST,
  SCRIPT_CONFIG,
  ConfigMap,
  ConfigItem,
} from './config/scriptConfig';
import { configParser, WebgalConfig } from './configParser/configParser';
import { fileType } from './interface/assets';
import { IAsset } from './interface/sceneInterface';
import { sceneParser } from './sceneParser';
import { IWebGALStyleObj, scss2cssinjsParser } from "./styleParser";
import { sceneTextPreProcess } from "./sceneTextPreProcessor";

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
export { sceneTextPreProcess };
