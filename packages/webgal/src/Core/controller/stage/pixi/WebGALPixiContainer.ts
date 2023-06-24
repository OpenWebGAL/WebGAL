import * as PIXI from 'pixi.js';
import { WebGALPixiFilters } from '@/Core/controller/stage/pixi/WebGALPixiFilters';
import { logger } from '@/Core/util/etc/logger';

export class WebGALPixiContainer extends PIXI.Container {
  private baseX = 0;
  private baseY = 0;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public containerFilters = new Map<string, PIXI.Filter>();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public webgalFilters = new WebGALPixiFilters(this.containerFilters, this);
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

  private addFilter(filter: PIXI.Filter) {
    if (this.filters) {
      logger.debug('PUSH FILTER', filter);
      this.filters.push(filter);
    } else {
      logger.debug('INIT FILTER', filter);
      this.filters = [];
      this.filters.push(filter);
    }
  }
}
