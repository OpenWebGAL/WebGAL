import { BacklogManager } from '@/Core/Modules/backlog';
import mitt from 'mitt';
import { SceneManager } from '@/Core/Modules/scene';
import { AnimationManager } from '@/Core/Modules/animations';
import { Gameplay } from './Modules/gamePlay';

export class WebgalCore {
  public backlogManager = new BacklogManager();
  public sceneManager = new SceneManager();
  public animationManager = new AnimationManager();
  public gameplay = new Gameplay();
  public gameName = '';
  public gameKey = '';
  public eventBus = mitt();
}
