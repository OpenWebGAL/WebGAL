import { OldFilmFilter } from '@pixi/filter-old-film';
import { DotFilter } from '@pixi/filter-dot';
import { ReflectionFilter } from '@pixi/filter-reflection';
import { GlitchFilter } from '@pixi/filter-glitch';
import { RGBSplitFilter } from '@pixi/filter-rgb-split';
import { GodrayFilter } from '@pixi/filter-godray';
import * as PIXI from 'pixi.js';

export class WebGALPixiContainer extends PIXI.Container {
  private baseX = 0;
  private baseY = 0;

  private containerFilters = new Map<string, PIXI.Filter>();

  public constructor() {
    super();
  }

  public get blur(): number {
    // @ts-ignore
    return this.getOrCreateBlurFilter().blur as number;
  }

  public set blur(value: number) {
    // @ts-ignore
    this.getOrCreateBlurFilter().blur = value;
  }

  public get x() {
    return super.position.x - this.baseX;
  }

  public set x(value) {
    super.position.x = value + this.baseX;
  }

  public get y() {
    return super.position.y - this.baseY;
  }

  public set y(value) {
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

  private getOrCreateBlurFilter() {
    const blurFilterFromMap = this.containerFilters.get('blur');
    if (blurFilterFromMap) {
      return blurFilterFromMap;
    } else {
      const blurFilter = new PIXI.filters.BlurFilter();
      // 默认的 blur 是8，覆盖掉
      blurFilter.blur = 0;
      this.addFilter(blurFilter);
      this.containerFilters.set('blur', blurFilter);
      return blurFilter;
    }
  }

  /**
   * old film filter
   * @private
   */
  private getOrCreateOldFilmFilter() {
    const blurFilterFromMap = this.containerFilters.get('oldFilm');
    if (blurFilterFromMap) {
      return blurFilterFromMap;
    } else {
      const oldFilm = new OldFilmFilter();
      this.addFilter(oldFilm);
      this.containerFilters.set('oldFilm', oldFilm);
      return oldFilm;
    }
  }
  public get oldFilm(): number {
    this.getOrCreateOldFilmFilter();
    return 0;
  }

  public set oldFilm(value: number) {
    console.log('set oldfilm');
    this.getOrCreateOldFilmFilter();
  }

  /**
   * dot film filter
   * @private
   */
  private getOrCreateDotFilter() {
    const blurFilterFromMap = this.containerFilters.get('dotFilm');
    if (blurFilterFromMap) {
      return blurFilterFromMap;
    } else {
      const dotFilm = new DotFilter();
      this.addFilter(dotFilm);
      this.containerFilters.set('dotFilm', dotFilm);
      return dotFilm;
    }
  }
  public get dotFilm(): number {
    this.getOrCreateDotFilter();
    return 0;
  }

  public set dotFilm(value: number) {
    console.log('set dotFilm');
    this.getOrCreateDotFilter();
  }

  /**
   * reflection film filter
   * @private
   */
  private getOrCreateReflectionFilter() {
    const blurFilterFromMap = this.containerFilters.get('reflectionFilm');
    if (blurFilterFromMap) {
      return blurFilterFromMap;
    } else {
      const reflectionFilm = new ReflectionFilter();
      this.addFilter(reflectionFilm);
      this.containerFilters.set('reflectionFilm', reflectionFilm);
      return reflectionFilm;
    }
  }
  public get reflectionFilm(): number {
    this.getOrCreateReflectionFilter();
    return 0;
  }

  public set reflectionFilm(value: number) {
    console.log('set reflectionFilm');
    this.getOrCreateReflectionFilter();
  }

   /**
   * glitchFilter film filter
   * @private
   */
  private getOrCreateGlitchFilter() {
    const blurFilterFromMap = this.containerFilters.get('glitchFilm');
    if (blurFilterFromMap) {
      return blurFilterFromMap;
    } else {
      const glitchFilm = new GlitchFilter();
      this.addFilter(glitchFilm);
      this.containerFilters.set('glitchFilm', glitchFilm);
      return glitchFilm;
    }
  }
  public get glitchFilm(): number {
    this.getOrCreateGlitchFilter();
    return 0;
  }

  public set glitchFilm(value: number) {
    console.log('set glitchFilm');
    this.getOrCreateGlitchFilter();
  }

   /**
   * rgbSplitFilter film filter
   * @private
   */
  private getOrCreateRGBSplitFilter() {
    const blurFilterFromMap = this.containerFilters.get('rgbFilm');
    if (blurFilterFromMap) {
      return blurFilterFromMap;
    } else {
      const rgbFilm = new RGBSplitFilter();
      this.addFilter(rgbFilm);
      this.containerFilters.set('rgbFilm', rgbFilm);
      return rgbFilm;
    }
  }
  public get rgbFilm(): number {
    this.getOrCreateRGBSplitFilter();
    return 0;
  }

  public set rgbFilm(value: number) {
    console.log('set rgbFilm');
    this.getOrCreateRGBSplitFilter();
  }

   /**
   * godrayFilter film filter
   * @private
   */
  private getOrCreateGodrayFilter() {
    const blurFilterFromMap = this.containerFilters.get('godrayFilm');
    if (blurFilterFromMap) {
      return blurFilterFromMap;
    } else {
      const godrayFilm = new GodrayFilter();
      this.addFilter(godrayFilm);
      this.containerFilters.set('godrayFilm', godrayFilm);
      return godrayFilm;
    }
  }
  public get godrayFilm(): number {
    this.getOrCreateGodrayFilter();
    return 0;
  }

  public set godrayFilm(value: number) {
    console.log('set godrayFilm');
    this.getOrCreateGodrayFilter();
  }

  private addFilter(filter: PIXI.Filter) {
    if (this.filters) {
      this.filters.push(filter);
    } else {
      this.filters = [filter];
    }
  }
}
