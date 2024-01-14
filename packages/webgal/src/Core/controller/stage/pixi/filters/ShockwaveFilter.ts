import { WebGALPixiContainer } from '@/Core/controller/stage/pixi/WebGALPixiContainer';
import { ShockwaveFilter } from 'pixi-filters';

export function getOrCreateShockwaveFilterImpl(container: WebGALPixiContainer, createMode: boolean) {
  const shockwaveFilterFromMap = container.containerFilters.get('shockwaveFilter');
  if (shockwaveFilterFromMap) {
    return shockwaveFilterFromMap;
  } else {
    if (createMode) {
      const shockwaveFilter = new ShockwaveFilter([1280, 720]);
      shockwaveFilter.time = 0;
      container.addFilter(shockwaveFilter);
      container.containerFilters.set('shockwaveFilter', shockwaveFilter);
      return shockwaveFilter;
    }
  }
}

export function getShockwaveFilter(container: WebGALPixiContainer) {
  if (container.getOrCreateShockwaveFilter(false)) {
    const shockwaveFilter = container.getOrCreateShockwaveFilter() as ShockwaveFilter;
    return shockwaveFilter.time;
  }
  return 0;
}

export function setShockwaveFilter(container: WebGALPixiContainer, value: number) {
  /**
   * 如果是0，就移除这个滤镜
   */
  if (value === 0) {
    container.removeFilter('shockwaveFilter');
  } else {
    const shockwaveFilter = container.getOrCreateShockwaveFilter() as ShockwaveFilter;
    if (shockwaveFilter) shockwaveFilter.time = value;
  }
}
