import {IScene} from "../../interface/scene";
import {runtime_currentSceneData} from "../../runtime/sceneData";

const callScene = (scene: IScene) => {

    runtime_currentSceneData.currentScene = scene;

}