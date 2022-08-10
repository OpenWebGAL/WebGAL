import { commandType } from '@/interface/coreInterface/sceneInterface';

export interface IConfigInterface {
  scriptString: string;
  scriptType: commandType;
  scriptFunction: Function;
}
