import { generateUniversalSoftInAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftIn';
import { generateUniversalSoftOffAnimationObj } from '@/Core/controller/stage/pixi/animations/universalSoftOff';

export const webgalAnimations: Array<{ name: string; animationGenerateFunc: Function }> = [
  { name: 'universalSoftIn', animationGenerateFunc: generateUniversalSoftInAnimationObj },
  { name: 'universalSoftOff', animationGenerateFunc: generateUniversalSoftOffAnimationObj },
];
