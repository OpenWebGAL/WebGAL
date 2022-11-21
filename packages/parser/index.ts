import { IAsset } from "./interface/sceneInterface";
import { fileType } from "./interface/assets";
import { sceneParser } from "./sceneParser";

export class SceneParser {

  private assetsPrefetcher;
  private assetSetter;
  private ADD_NEXT_ARG_LIST;
  private SCRIPT_CONFIG;

  constructor(assetsPrefetcher: ((assetList: Array<IAsset>) => void),
              assetSetter: (fileName: string, assetType: fileType) => string,
              ADD_NEXT_ARG_LIST, SCRIPT_CONFIG) {
    this.assetsPrefetcher = assetsPrefetcher;
    this.assetSetter = assetSetter;
    this.ADD_NEXT_ARG_LIST = ADD_NEXT_ARG_LIST;
    this.SCRIPT_CONFIG = SCRIPT_CONFIG;
  }

  parse(rawScene: string, sceneName: string, sceneUrl: string
  ) {
    return sceneParser(rawScene, sceneName, sceneUrl, this.assetsPrefetcher, this.assetSetter, this.ADD_NEXT_ARG_LIST, this.SCRIPT_CONFIG);
  }
}
