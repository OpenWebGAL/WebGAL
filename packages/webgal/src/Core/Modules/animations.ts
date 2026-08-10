import { ITransform } from '@/Core/Modules/stage/stageInterface';

export interface IUserAnimation {
  name: string;
  effects: Array<AnimationFrame>;
  /** Runtime marker for frames composed on top of the target's resolved transform. */
  frameMode?: 'relative';
}

export type AnimationFrame = ITransform & { duration: number; ease: string };

export type UserAnimationResource =
  | Array<AnimationFrame>
  | {
      effects: Array<AnimationFrame>;
      /** Structured resources are relative by default; opt into legacy absolute values explicitly. */
      frameMode?: 'relative' | 'absolute';
    };

export function createUserAnimation(name: string, resource: UserAnimationResource): IUserAnimation {
  if (Array.isArray(resource)) {
    return { name, effects: resource };
  }
  return {
    name,
    effects: resource.effects,
    ...(resource.frameMode !== 'absolute' ? { frameMode: 'relative' as const } : {}),
  };
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
