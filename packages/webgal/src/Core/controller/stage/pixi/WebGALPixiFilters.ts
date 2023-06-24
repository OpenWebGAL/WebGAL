import * as PIXI from 'pixi.js';
import { OldFilmFilter } from '@pixi/filter-old-film';
import { WebGALPixiContainer } from '@/Core/controller/stage/pixi/WebGALPixiContainer';
import { logger } from '@/Core/util/etc/logger';

export class WebGALPixiFilters {
  private readonly container: WebGALPixiContainer;
  public constructor(filters: Map<string, PIXI.Filter>, container: WebGALPixiContainer) {
    this.container = container;
  }

  /**
   * 添加更多 filters
   */

  /**
   * OldFilmFilter
   * @private
   */
  private getOrCreateOldFilmFilter() {
    const blurFilterFromMap = this.container.containerFilters.get('oldFilm');
    if (blurFilterFromMap) {
      return blurFilterFromMap;
    } else {
      const oldFilm = new OldFilmFilter();
      this.addFilter(oldFilm);
      this.container.containerFilters.set('oldFilm', oldFilm);
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

  private addFilter(filter: PIXI.Filter) {
    if (this.container.filters) {
      logger.debug('PUSH FILTER', filter);
      this.container.filters.push(filter);
    } else {
      logger.debug('INIT FILTER', filter);
      this.container.filters = [];
      this.container.filters.push(filter);
    }
  }
}
