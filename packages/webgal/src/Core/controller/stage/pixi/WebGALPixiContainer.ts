import { OldFilmFilter } from '@pixi/filter-old-film';
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
