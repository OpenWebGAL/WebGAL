import { OldFilmFilter } from '@pixi/filter-old-film';
import { DotFilter } from '@pixi/filter-dot';
import { ReflectionFilter } from '@pixi/filter-reflection';
import { GlitchFilter } from '@pixi/filter-glitch';
import { RGBSplitFilter } from '@pixi/filter-rgb-split';
import { GodrayFilter } from '@pixi/filter-godray';
import * as PIXI from 'pixi.js';
import {
  getOrCreateShockwaveFilterImpl,
  getShockwaveFilter,
  setShockwaveFilter,
} from '@/Core/controller/stage/pixi/filters/ShockwaveFilter';
import {
  getOrCreateRadiusAlphaFilterImpl,
  getRadiusAlphaFilter,
  setRadiusAlphaFilter,
} from '@/Core/controller/stage/pixi/shaders/RadiusAlphaFilter';
import { AdjustmentFilter } from 'pixi-filters';

export class WebGALPixiContainer extends PIXI.Container {
  public containerFilters = new Map<string, PIXI.Filter>();
  private baseX = 0;
  private baseY = 0;

  private alphaFilter = new PIXI.filters.AlphaFilter(1);

  public constructor() {
    super();
    this.addFilter(this.alphaFilter);
  }

  public get alphaFilterVal() {
    return this.alphaFilter.alpha;
  }

  public set alphaFilterVal(value: number) {
    this.alphaFilter.alpha = value;
  }

  public addFilter(filter: PIXI.Filter) {
    if (this.filters) {
      this.filters.push(filter);
    } else {
      this.filters = [filter];
    }
  }

  public removeFilter(name: string) {
    const filter = this.containerFilters.get(name);
    if (filter) {
      const index = (this?.filters ?? []).findIndex((e) => e === filter);
      if (this.filters) {
        this.filters.splice(index, 1);
        this.containerFilters.delete(name);
      }
    }
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

  public getOrCreateBlurFilter() {
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
   * adjustment filter
   * @public
   */
  public getOrCreateAdjustmentFilter(): AdjustmentFilter {
    const filterFromMap = this.containerFilters.get('adjustment');
    if (filterFromMap) {
      return filterFromMap as AdjustmentFilter;
    } else {
      const adjustment = new AdjustmentFilter();
      this.addFilter(adjustment);
      this.containerFilters.set('adjustment', adjustment);
      return adjustment;
    }
  }

  public isAdjustmentFilterExist(): boolean {
    return this.containerFilters.has('adjustment');
  }

  public get brightness(): number {
    return this.getOrCreateAdjustmentFilter().brightness;
  }
  public set brightness(value: number) {
    if (value === 1 && !this.isAdjustmentFilterExist()) return;
    this.getOrCreateAdjustmentFilter().brightness = value;
  }

  public get contrast(): number {
    return this.getOrCreateAdjustmentFilter().contrast;
  }
  public set contrast(value: number) {
    if (value === 1 && !this.isAdjustmentFilterExist()) return;
    this.getOrCreateAdjustmentFilter().contrast = value;
  }

  public get saturation(): number {
    return this.getOrCreateAdjustmentFilter().saturation;
  }
  public set saturation(value: number) {
    if (value === 1 && !this.isAdjustmentFilterExist()) return;
    this.getOrCreateAdjustmentFilter().saturation = value;
  }

  public get gamma(): number {
    return this.getOrCreateAdjustmentFilter().gamma;
  }
  public set gamma(value: number) {
    if (value === 1 && !this.isAdjustmentFilterExist()) return;
    this.getOrCreateAdjustmentFilter().gamma = value;
  }

  public get colorRed(): number {
    return this.getOrCreateAdjustmentFilter().red * 255.0;
  }
  public set colorRed(value: number) {
    if (value === 255 && !this.isAdjustmentFilterExist()) return;
    this.getOrCreateAdjustmentFilter().red = value / 255.0;
  }

  public get colorGreen(): number {
    return this.getOrCreateAdjustmentFilter().green * 255.0;
  }
  public set colorGreen(value: number) {
    if (value === 255 && !this.isAdjustmentFilterExist()) return;
    this.getOrCreateAdjustmentFilter().green = value / 255.0;
  }

  public get colorBlue(): number {
    return this.getOrCreateAdjustmentFilter().blue * 255.0;
  }
  public set colorBlue(value: number) {
    if (value === 255 && !this.isAdjustmentFilterExist()) return;
    this.getOrCreateAdjustmentFilter().blue = value / 255.0;
  }

  /**
   * old film filter
   * @public
   */
  public getOrCreateOldFilmFilter(createMode = true) {
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
   * @public
   */
  public getOrCreateDotFilter(createMode = true) {
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
   * @public
   */
  public getOrCreateReflectionFilter(createMode = true) {
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
   * @public
   */
  public getOrCreateGlitchFilter(createMode = true) {
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
   * @public
   */
  public getOrCreateRGBSplitFilter(createMode = true) {
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
   * @public
   */
  public getOrCreateGodrayFilter(createMode = true) {
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

  /**
   * ShockwaveFilter
   */

  public getOrCreateShockwaveFilter(createMode = true) {
    return getOrCreateShockwaveFilterImpl(this, createMode);
  }
  public get shockwaveFilter(): number {
    return getShockwaveFilter(this);
  }
  public set shockwaveFilter(value: number) {
    setShockwaveFilter(this, value);
  }

  /**
   * RadiusAlphaFilter
   */

  public getOrCreateRadiusAlphaFilter(createMode = true) {
    return getOrCreateRadiusAlphaFilterImpl(this, createMode);
  }
  public get radiusAlphaFilter(): number {
    return getRadiusAlphaFilter(this);
  }
  public set radiusAlphaFilter(value: number) {
    setRadiusAlphaFilter(this, value);
  }
}
