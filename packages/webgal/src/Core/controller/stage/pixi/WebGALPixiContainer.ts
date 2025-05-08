import * as PIXI from 'pixi.js';
import { FilterManager } from '@/Core/controller/stage/pixi//FilterManager';

export class WebGALPixiContainer extends PIXI.Container {
  public containerFilters = new Map<string, PIXI.Filter>();
  private baseX = 0;
  private baseY = 0;

  private filterManager = new FilterManager();

  public constructor() {
    super();
    // 确保 filters 不为空数组
    this.filters = [];
  }

  public get x() {
    const rX = super.position?.x ?? 0;
    return rX - this.baseX;
  }

  public set x(value) {
    if (!super.position) {
      return;
    }
    super.position.x = value + this.baseX;
  }

  public get y() {
    const rY = super.position?.y ?? 0;
    return rY - this.baseY;
  }

  public set y(value) {
    if (!super.position) {
      return;
    }
    super.position.y = value + this.baseY;
  }

  public setBaseX(x: number) {
    const originalX = this.x;
    this.baseX = x;
    this.x = originalX;
  }

  public setBaseY(y: number) {
    const originalY = this.y;
    this.baseY = y;
    this.y = originalY;
  }

  private updateFiltersIfNeed() {
    if (this.filterManager.updateNeeded) {
      this.filterManager.updateFilters(this.filters);
      this.filterManager.updateNeeded = false;
    }
  }

  public get alphaFilterVal() {
    return this.filterManager.alpha;
  }

  public set alphaFilterVal(value: number) {
    this.filterManager.alpha = value;
    this.updateFiltersIfNeed();
  }

  public get blur(): number {
    return this.filterManager.blur;
  }

  public set blur(value: number) {
    this.filterManager.blur = value;
    this.updateFiltersIfNeed();
  }

  public get bevel(): number {
    return this.filterManager.bevel;
  }

  public set bevel(value: number) {
    this.filterManager.bevel = value;
    this.updateFiltersIfNeed();
  }

  public get bevelThickness(): number {
    return this.filterManager.bevelThickness;
  }

  public set bevelThickness(value: number) {
    this.filterManager.bevelThickness = value;
    this.updateFiltersIfNeed();
  }

  public get bevelRotation(): number {
    return this.bevelRotation;
  }

  public set bevelRotation(value: number) {
    this.filterManager.bevelRotation = value;
    this.updateFiltersIfNeed();
  }

  public get bevelRed(): number {
    return this.filterManager.bevelRed;
  }

  public set bevelRed(value: number) {
    this.filterManager.bevelRed = Math.max(0, Math.min(255, value));
    this.updateFiltersIfNeed();
  }

  public get bevelGreen(): number {
    return this.filterManager.bevelGreen;
  }

  public set bevelGreen(value: number) {
    this.filterManager.bevelGreen = Math.max(0, Math.min(255, value));
    this.updateFiltersIfNeed();
  }

  public get bevelBlue(): number {
    return this.filterManager.bevelBlue;
  }

  public set bevelBlue(value: number) {
    this.filterManager.bevelBlue = Math.max(0, Math.min(255, value));
    this.updateFiltersIfNeed();
  }

  public get bloom(): number {
    return this.filterManager.bloom as number;
  }

  public set bloom(value: number) {
    this.filterManager.bloom = value;
    this.updateFiltersIfNeed();
  }

  public get bloomBrightness(): number {
    return this.filterManager.bloomBrightness;
  }

  public set bloomBrightness(value: number) {
    this.filterManager.bloomBrightness = value;
    this.updateFiltersIfNeed();
  }

  public get bloomBlur(): number {
    return this.filterManager.bloomBlur;
  }

  public set bloomBlur(value: number) {
    this.filterManager.bloomBlur = value;
    this.updateFiltersIfNeed();
  }

  public get bloomThreshold(): number {
    return this.filterManager.bloomThreshold;
  }

  public set bloomThreshold(value: number) {
    this.filterManager.bloomThreshold = value;
    this.updateFiltersIfNeed();
  }

  public get brightness(): number {
    return this.filterManager.brightness;
  }
  public set brightness(value: number) {
    this.filterManager.brightness = value;
    this.updateFiltersIfNeed();
  }

  public get contrast(): number {
    return this.filterManager.contrast;
  }
  public set contrast(value: number) {
    this.filterManager.contrast = value;
    this.updateFiltersIfNeed();
  }

  public get saturation(): number {
    return this.filterManager.saturation;
  }
  public set saturation(value: number) {
    this.filterManager.saturation = value;
    this.updateFiltersIfNeed();
  }

  public get gamma(): number {
    return this.filterManager.gamma;
  }
  public set gamma(value: number) {
    this.filterManager.gamma = value;
    this.updateFiltersIfNeed();
  }

  public get colorRed(): number {
    return this.filterManager.colorRed;
  }
  public set colorRed(value: number) {
    this.filterManager.colorRed = value;
    this.updateFiltersIfNeed();
  }

  public get colorGreen(): number {
    return this.filterManager.colorGreen;
  }
  public set colorGreen(value: number) {
    this.filterManager.colorGreen = value;
    this.updateFiltersIfNeed();
  }

  public get colorBlue(): number {
    return this.filterManager.colorBlue;
  }
  public set colorBlue(value: number) {
    this.filterManager.colorBlue = value;
    this.updateFiltersIfNeed();
  }

  public get oldFilm(): number {
    return this.filterManager.oldFilm;
  }

  public set oldFilm(value: number) {
    this.filterManager.oldFilm = value;
    this.updateFiltersIfNeed();
  }

  public get dotFilm(): number {
    return this.filterManager.dot;
  }

  public set dotFilm(value: number) {
    this.filterManager.dot = value;
    this.updateFiltersIfNeed();
  }

  public get reflectionFilm(): number {
    return this.filterManager.reflection;
  }

  public set reflectionFilm(value: number) {
    this.filterManager.reflection = value;
    this.updateFiltersIfNeed();
  }

  public get glitchFilm(): number {
    return this.filterManager.glitch;
  }

  public set glitchFilm(value: number) {
    this.filterManager.glitch = value;
    this.updateFiltersIfNeed();
  }

  public get rgbFilm(): number {
    return this.filterManager.rgbSplit;
  }

  public set rgbFilm(value: number) {
    this.filterManager.rgbSplit = value;
    this.updateFiltersIfNeed();
  }

  public get godrayFilm(): number {
    return this.filterManager.godray;
  }

  public set godrayFilm(value: number) {
    this.filterManager.godray = value;
    this.updateFiltersIfNeed();
  }

  public get shockwave(): number {
    return this.filterManager.shockwave;
  }

  public set shockwave(value: number) {
    this.filterManager.shockwave = value;
    this.updateFiltersIfNeed();
  }

  public get radiusAlpha(): number {
    return this.filterManager.radiusAlpha;
  }

  public set radiusAlpha(value: number) {
    this.filterManager.radiusAlpha = value;
    this.updateFiltersIfNeed();
  }
}
