import { commandType } from '@/Core/controller/scene/sceneInterface';

export interface IConfigInterface {
  scriptString: string;
  scriptType: commandType;
  scriptFunction: Function;
}
