import {commandType, IAsset} from "./interface/sceneInterface";
import {fileType} from "./interface/assets";
import {sceneParser} from "./sceneParser";
import {ADD_NEXT_ARG_LIST, SCRIPT_CONFIG} from "./config/scriptConfig";
import {configParser} from "@/configParser/configParser";

export default class SceneParser {

  private readonly assetsPrefetcher;
  private readonly assetSetter;
  private readonly ADD_NEXT_ARG_LIST;
  private readonly SCRIPT_CONFIG;

  constructor(assetsPrefetcher: ((assetList: Array<IAsset>) => void),
              assetSetter: (fileName: string, assetType: fileType) => string,
              ADD_NEXT_ARG_LIST: Array<number>, SCRIPT_CONFIG: Array<any>) {
    this.assetsPrefetcher = assetsPrefetcher;
    this.assetSetter = assetSetter;
    this.ADD_NEXT_ARG_LIST = ADD_NEXT_ARG_LIST;
    this.SCRIPT_CONFIG = SCRIPT_CONFIG;
  }

  parse(rawScene: string, sceneName: string, sceneUrl: string
  ) {
    return sceneParser(rawScene, sceneName, sceneUrl, this.assetsPrefetcher, this.assetSetter, this.ADD_NEXT_ARG_LIST, this.SCRIPT_CONFIG);
  }

  parseConfig(configText: string) {
    return configParser(configText)
  }
}

export {ADD_NEXT_ARG_LIST, SCRIPT_CONFIG};
