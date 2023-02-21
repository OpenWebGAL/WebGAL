import { commandType, IAsset } from "./interface/sceneInterface";
import { fileType } from "./interface/assets";
export default class SceneParser {
    private readonly assetsPrefetcher;
    private readonly assetSetter;
    private readonly ADD_NEXT_ARG_LIST;
    private readonly SCRIPT_CONFIG;
    constructor(assetsPrefetcher: ((assetList: Array<IAsset>) => void), assetSetter: (fileName: string, assetType: fileType) => string, ADD_NEXT_ARG_LIST: Array<commandType>, SCRIPT_CONFIG: Array<any>);
    parse(rawScene: string, sceneName: string, sceneUrl: string): import("./interface/sceneInterface").IScene;
}
