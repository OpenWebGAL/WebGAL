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
  private getOrCreateOldFilmFilter(createMode = true) {
    const blurFilterFromMap = this.containerFilters.get('oldFilm');
    if (blurFilterFromMap) {
      return blurFilterFromMap;
    } else {
      if (createMode) {
        const oldFilm = new OldFilmFilter();
        this.addFilter(oldFilm);
        this.containerFilters.set('oldFilm', oldFilm);
        return oldFilm;
      } else return null;
    }
  }
  public get oldFilm(): number {
    if (this.getOrCreateOldFilmFilter(false)) return 1;
    return 0;
  }

  public set oldFilm(value: number) {
    /**
     * 如果是0，就移除这个滤镜
     */
    if (value === 0) {
      this.removeFilter('oldFilm');
    } else this.getOrCreateOldFilmFilter();
  }

  /**
   * dot film filter
   * @private
   */
  private getOrCreateDotFilter(createMode = true) {
    const blurFilterFromMap = this.containerFilters.get('dotFilm');
    if (blurFilterFromMap) {
      return blurFilterFromMap;
    } else {
      if (createMode) {
        const dotFilm = new DotFilter();
        this.addFilter(dotFilm);
        this.containerFilters.set('dotFilm', dotFilm);
        return dotFilm;
      } else return null;
    }
  }
  public get dotFilm(): number {
    if (this.getOrCreateDotFilter(false)) return 1;
    return 0;
  }

  public set dotFilm(value: number) {
    /**
     * 如果是0，就移除这个滤镜
     */
    if (value === 0) {
      this.removeFilter('dotFilm');
    } else this.getOrCreateDotFilter();
  }

  /**
   * reflection film filter
   * @private
   */
  private getOrCreateReflectionFilter(createMode = true) {
    const blurFilterFromMap = this.containerFilters.get('reflectionFilm');
    if (blurFilterFromMap) {
      return blurFilterFromMap;
    } else {
      if (createMode) {
        const reflectionFilm = new ReflectionFilter();
        this.addFilter(reflectionFilm);
        this.containerFilters.set('reflectionFilm', reflectionFilm);
        return reflectionFilm;
      } else return null;
    }
  }
  public get reflectionFilm(): number {
    if (this.getOrCreateReflectionFilter(false)) return 1;
    return 0;
  }

  public set reflectionFilm(value: number) {
    /**
     * 如果是0，就移除这个滤镜
     */
    if (value === 0) {
      this.removeFilter('reflectionFilm');
    } else this.getOrCreateReflectionFilter();
  }

   /**
   * glitchFilter film filter
   * @private
   */
  private getOrCreateGlitchFilter(createMode = true) {
    const blurFilterFromMap = this.containerFilters.get('glitchFilm');
    if (blurFilterFromMap) {
      return blurFilterFromMap;
    } else {
      if (createMode) {
        const glitchFilm = new GlitchFilter();
        this.addFilter(glitchFilm);
        this.containerFilters.set('glitchFilm', glitchFilm);
        return glitchFilm;
      } else return null;
    }
  }
  public get glitchFilm(): number {
    if (this.getOrCreateGlitchFilter(false)) return 1;
    return 0;
  }

  public set glitchFilm(value: number) {
    /**
     * 如果是0，就移除这个滤镜
     */
    if (value === 0) {
      this.removeFilter('glitchFilm');
    } else this.getOrCreateGlitchFilter();
  }

   /**
   * rgbSplitFilter film filter
   * @private
   */
  private getOrCreateRGBSplitFilter(createMode = true) {
    const blurFilterFromMap = this.containerFilters.get('rgbFilm');
    if (blurFilterFromMap) {
      return blurFilterFromMap;
    } else {
      if (createMode) {
        const rgbFilm = new RGBSplitFilter();
        this.addFilter(rgbFilm);
        this.containerFilters.set('rgbFilm', rgbFilm);
        return rgbFilm;
      }
    }
  }
  public get rgbFilm(): number {
    if (this.getOrCreateRGBSplitFilter(false)) return 1;
    return 0;
  }

  public set rgbFilm(value: number) {
    /**
     * 如果是0，就移除这个滤镜
     */
    if (value === 0) {
      this.removeFilter('rgbFilm');
    } else this.getOrCreateRGBSplitFilter();
  }

   /**
   * godrayFilter film filter
   * @private
   */
  private getOrCreateGodrayFilter(createMode = true) {
    const blurFilterFromMap = this.containerFilters.get('godrayFilm');
    if (blurFilterFromMap) {
      return blurFilterFromMap;
    } else {
      if (createMode) {
        const godrayFilm = new GodrayFilter();
        this.addFilter(godrayFilm);
        this.containerFilters.set('godrayFilm', godrayFilm);
        return godrayFilm;
      }
    }
  }
  public get godrayFilm(): number {
    if (this.getOrCreateGodrayFilter(false)) return 1;
    return 0;
  }

  public set godrayFilm(value: number) {
    /**
     * 如果是0，就移除这个滤镜
     */
    if (value === 0) {
      this.removeFilter('godrayFilm');
    } else this.getOrCreateGodrayFilter();
  }

  private addFilter(filter: PIXI.Filter) {
    if (this.filters) {
      this.filters.push(filter);
    } else {
      this.filters = [filter];
    }
  }

  private removeFilter(name: string) {
    const filter = this.containerFilters.get(name);
    if (filter) {
      const index = (this?.filters ?? []).findIndex((e) => e === filter);
      if (this.filters) {
        this.filters.splice(index, 1);
        this.containerFilters.delete(name);
      }
    }
  }
}
