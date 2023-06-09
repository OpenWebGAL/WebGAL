import { ITransform } from '@/store/stageInterface';

export interface IUserAnimation {
  name: string;
  effects: Array<ITransform & { duration: number }>;
}

export class AnimationManager {
  private animations: Array<IUserAnimation> = [];
  public addAnimation(animation: IUserAnimation) {
    this.animations.push(animation);
  }
  public getAnimations() {
    return this.animations;
  }
}
