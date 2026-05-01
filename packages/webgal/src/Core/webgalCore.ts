import { BacklogManager } from '@/Core/Modules/backlog';
import { ReadHistoryManager } from './Modules/readHistory';
import VConsole from 'vconsole';
import { SceneManager } from '@/Core/Modules/scene';
import { AnimationManager } from '@/Core/Modules/animations';
import { Gameplay } from './Modules/gamePlay';
import { Events } from '@/Core/Modules/events';
import { SteamIntegration } from '@/Core/integration/steamIntegration';
import { WebgalTemplate } from '@/types/template';
import { IWebGALStyleObj } from 'webgal-parser/build/types/styleParser';
import { IVConsole } from '@/types/vconsole';

const vconsole = {
  instance: new VConsole({ target: 'body' }),
  show() {
    (document.querySelector('#__vconsole') as HTMLDivElement).style.display = 'block';
  },
  hide() {
    (document.querySelector('#__vconsole') as HTMLDivElement).style.display = 'none';
  },
};
vconsole.hide();

export class WebgalCore {
  public sceneManager = new SceneManager();
  public backlogManager = new BacklogManager(this.sceneManager);
  public readHistoryManager = new ReadHistoryManager(this.sceneManager);
  public animationManager = new AnimationManager();
  public gameplay = new Gameplay();
  public gameName = '';
  public gameKey = '';
  public events = new Events();
  public steam = new SteamIntegration();
  public template: WebgalTemplate | null = null;
  public styleObjects: Map<string, IWebGALStyleObj> = new Map();
  public vconsole: IVConsole = vconsole;
}
