import {
  ADD_NEXT_ARG_LIST,
  SCRIPT_CONFIG,
  ConfigMap,
} from './config/scriptConfig';
import { configParser, WebgalConfig } from './configParser/configParser';
import { fileType } from './interface/assets';
import { IAsset } from './interface/sceneInterface';
import { sceneParser } from './sceneParser';

export default class SceneParser {
  private readonly SCRIPT_CONFIG_MAP: ConfigMap;
  constructor(
    private readonly assetsPrefetcher: (assetList: IAsset[]) => void,
    private readonly assetSetter: (
      fileName: string,
      assetType: fileType,
    ) => string,
    private readonly ADD_NEXT_ARG_LIST: number[],
    SCRIPT_CONFIG_ARRAY: any[],
  ) {
    this.SCRIPT_CONFIG_MAP = new Map();
    SCRIPT_CONFIG_ARRAY.forEach((config) => {
      this.SCRIPT_CONFIG_MAP.set(config.scriptString, config);
    });
  }

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
}

export { ADD_NEXT_ARG_LIST, SCRIPT_CONFIG };
