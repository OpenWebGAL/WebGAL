import { ITransform } from '@/Core/Modules/stage/stageInterface';

export interface IUserAnimation {
  name: string;
  effects: Array<AnimationFrame>;
  /** User-authored frames are composed on top of the target's resolved transform. */
  frameMode?: 'relative';
}

export type AnimationFrame = ITransform & { duration: number; ease: string };

export type UserAnimationResource =
  | Array<AnimationFrame>
  | {
      effects: Array<AnimationFrame>;
    };

export function createUserAnimation(name: string, resource: UserAnimationResource): IUserAnimation {
  const effects = Array.isArray(resource) ? resource : resource.effects;
  return { name, effects, frameMode: 'relative' };
}

export class AnimationManager {
  // public nextEnterAnimationName: Map<string, string> = new Map();
  // public nextExitAnimationName: Map<string, string> = new Map();
  private animations: Array<IUserAnimation> = [];

  public addAnimation(animation: IUserAnimation) {
    this.animations.push(animation);
  }
  public getAnimations() {
    return this.animations;
  }
}
