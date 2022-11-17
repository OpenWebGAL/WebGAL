import * as PIXI from 'pixi.js';

export function setBlurFilter(container: PIXI.Container) {
  // @ts-ignore
  container.blurFilter = container.filters[0];
}
