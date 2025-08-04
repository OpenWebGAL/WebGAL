import { OldFilmFilter } from '@pixi/filter-old-film';
import { DotFilter } from '@pixi/filter-dot';
import { ReflectionFilter } from '@pixi/filter-reflection';
import { GlitchFilter } from '@pixi/filter-glitch';
import { RGBSplitFilter } from '@pixi/filter-rgb-split';
import { GodrayFilter } from '@pixi/filter-godray';
import { AdjustmentFilter, AdvancedBloomFilter, ShockwaveFilter } from 'pixi-filters';
import { BevelFilter } from '@/Core/controller/stage/pixi/shaders/BevelFilter';
import * as PIXI from 'pixi.js';
import { BlurFilter } from '@pixi/filter-blur';
import { INIT_RAD, RadiusAlphaFilter } from '@/Core/controller/stage/pixi/shaders/RadiusAlphaFilter';

/**
 * Filter configuration for creation and default state detection.
 */
interface FilterConfig {
  priority: number;
  create: () => PIXI.Filter;
  isDefault?: (f: PIXI.Filter) => boolean;
}

/**
 * Property configuration for mapping class properties to filter effects.
 */
interface PropertyConfig {
  filterName: string;
  filterProperty?: string;
  defaultValue: number;
  isBoolean?: boolean;
  overrideSet?: (value: number, filter: PIXI.Filter, container: WebGALPixiContainer) => void;
  overrideGet?: (filter: PIXI.Filter | undefined, defaultValue: number, container: WebGALPixiContainer) => number;
}

// 滤镜顺序，靠上滤镜的排滤镜数组后面(在上层)
const enum FilterPriority {
  ReflectionFilm,
  RadiusAlpha,
  ShockWave,
  Blur,
  RgbFilm,
  DotFilm,
  GlitchFilm,
  OldFilm,
  Bloom,
  GodrayFilm,
  Bevel,
  Adjustment,
}

const FILTER_CONFIGS: Record<string, FilterConfig> = {
  blur: {
    priority: FilterPriority.Blur,
    create: () => {
      const f = new PIXI.filters.BlurFilter();
      f.blur = 0;
      return f;
    },
    isDefault: (f) => (f as BlurFilter).blur === 0,
  },
  oldFilm: {
    priority: FilterPriority.OldFilm,
    create: () => new OldFilmFilter(),
  },
  dotFilm: {
    priority: FilterPriority.DotFilm,
    create: () => new DotFilter(),
  },
  reflectionFilm: {
    priority: FilterPriority.ReflectionFilm,
    create: () => new ReflectionFilter(),
  },
  glitchFilm: {
    priority: FilterPriority.GlitchFilm,
    create: () => new GlitchFilter(),
  },
  rgbFilm: {
    priority: FilterPriority.RgbFilm,
    create: () => new RGBSplitFilter(),
  },
  godrayFilm: {
    priority: FilterPriority.GodrayFilm,
    create: () => new GodrayFilter(),
  },
  shockwave: {
    // Renamed from shockwaveFilter for consistency
    priority: FilterPriority.ShockWave, // Example priority
    create: () => {
      // The [1280, 720] seems to be the intended center in pixel coordinates.
      // This might need to be dynamic based on the container's actual size/stage size.
      // For now, using the value from the provided snippet.
      const f = new ShockwaveFilter([1280, 720]); // Center of the shockwave
      f.time = 0; // Initial time
      return f;
    },
    isDefault: (f) => (f as ShockwaveFilter).time === 0,
  },
  adjustment: {
    priority: FilterPriority.Adjustment,
    create: () => new AdjustmentFilter(),
    isDefault: (f) => {
      const a = f as AdjustmentFilter;
      return (
        a.brightness === 1 &&
        a.contrast === 1 &&
        a.saturation === 1 &&
        a.gamma === 1 &&
        a.red === 1 &&
        a.green === 1 &&
        a.blue === 1
      );
    },
  },
  radiusAlpha: {
    // Renamed from radiusAlphaFilter for consistency
    priority: FilterPriority.RadiusAlpha, // Example priority
    create: () => {
      // Center (0.5, 0.5) for normalized center of the texture
      const f = new RadiusAlphaFilter(new PIXI.Point(0.5, 0.5), INIT_RAD);
      return f;
    },
    isDefault: (f) => (f as RadiusAlphaFilter).radius === INIT_RAD,
  },
  bevel: {
    priority: FilterPriority.Bevel, // 示例优先级，请根据需要调整
    create: () => {
      const f = new BevelFilter();
      // BevelFilter 默认值
      f.lightAlpha = 0; // bevel
      f.thickness = 0; // bevelThickness
      f.rotation = 0; // bevelRotation
      f.softness = 0; // bevelSoftness
      // 默认 lightColor (255, 255, 255) -> 0xFFFFFF
      f.lightColor = 0xffffff;
      f.shadowAlpha = 0; // 通常边缘光不需要阴影
      return f;
    },
    isDefault: (f) => {
      const b = f as BevelFilter;
      return (
        b.lightAlpha === 0 &&
        b.thickness === 0 &&
        b.rotation === 0 &&
        b.softness === 0 &&
        b.lightColor === 0xffffff && // 假设默认白色
        b.shadowAlpha === 0
      );
    },
  },
  bloom: {
    // 使用 'bloom' 作为 filterName
    priority: FilterPriority.Bloom, // 示例优先级
    create: () => {
      const f = new AdvancedBloomFilter();
      // AdvancedBloomFilter 默认值
      f.bloomScale = 0; // bloom
      f.brightness = 1; // bloomBrightness
      f.blur = 0; // bloomBlur
      f.threshold = 0; // bloomThreshold
      // AdvancedBloomFilter 还有其他属性如 quality, blendMode，如果需要控制也应在此处设置初始值
      return f;
    },
    isDefault: (f) => {
      const ab = f as AdvancedBloomFilter;
      return ab.bloomScale === 0 && ab.brightness === 1 && ab.blur === 0 && ab.threshold === 0;
    },
  },
};

const PROPERTY_CONFIGS: Record<string, PropertyConfig> = {
  blur: {
    filterName: 'blur',
    filterProperty: 'blur',
    defaultValue: 0,
  },
  brightness: {
    filterName: 'adjustment',
    filterProperty: 'brightness',
    defaultValue: 1,
  },
  contrast: {
    filterName: 'adjustment',
    filterProperty: 'contrast',
    defaultValue: 1,
  },
  saturation: {
    filterName: 'adjustment',
    filterProperty: 'saturation',
    defaultValue: 1,
  },
  gamma: {
    filterName: 'adjustment',
    filterProperty: 'gamma',
    defaultValue: 1,
  },
  colorRed: {
    filterName: 'adjustment',
    defaultValue: 255,
    overrideSet: (value, filter) => {
      (filter as AdjustmentFilter).red = value / 255;
    },
    overrideGet: (filter, defaultValue) => (filter ? (filter as AdjustmentFilter).red * 255 : defaultValue),
  },
  colorGreen: {
    filterName: 'adjustment',
    defaultValue: 255,
    overrideSet: (value, filter) => {
      (filter as AdjustmentFilter).green = value / 255;
    },
    overrideGet: (filter, defaultValue) => (filter ? (filter as AdjustmentFilter).green * 255 : defaultValue),
  },
  colorBlue: {
    filterName: 'adjustment',
    defaultValue: 255,
    overrideSet: (value, filter) => {
      (filter as AdjustmentFilter).blue = value / 255;
    },
    overrideGet: (filter, defaultValue) => (filter ? (filter as AdjustmentFilter).blue * 255 : defaultValue),
  },
  oldFilm: { filterName: 'oldFilm', defaultValue: 0, isBoolean: true },
  dotFilm: { filterName: 'dotFilm', defaultValue: 0, isBoolean: true },
  reflectionFilm: { filterName: 'reflectionFilm', defaultValue: 0, isBoolean: true },
  glitchFilm: { filterName: 'glitchFilm', defaultValue: 0, isBoolean: true },
  rgbFilm: { filterName: 'rgbFilm', defaultValue: 0, isBoolean: true },
  godrayFilm: { filterName: 'godrayFilm', defaultValue: 0, isBoolean: true },
  shockwaveFilter: {
    // Public property name
    filterName: 'shockwave', // Key in FILTER_CONFIGS
    filterProperty: 'time', // Property on ShockwaveFilter instance
    defaultValue: 0,
  },
  radiusAlphaFilter: {
    // Public property name
    filterName: 'radiusAlpha', // Key in FILTER_CONFIGS
    filterProperty: 'radius', // Property on RadiusAlphaFilter instance
    defaultValue: INIT_RAD,
  },
  // Bevel Filter Properties
  bevel: {
    filterName: 'bevel',
    filterProperty: 'lightAlpha', // 'bevel' 公开属性映射到 lightAlpha
    defaultValue: 0,
  },
  bevelThickness: {
    filterName: 'bevel',
    filterProperty: 'thickness',
    defaultValue: 0,
  },
  bevelRotation: {
    filterName: 'bevel',
    filterProperty: 'rotation',
    defaultValue: 0,
  },
  bevelSoftness: {
    filterName: 'bevel',
    filterProperty: 'softness',
    defaultValue: 0,
  },
  bevelRed: {
    filterName: 'bevel',
    defaultValue: 255,
    overrideSet: (value, filter) => {
      const bFilter = filter as BevelFilter;
      const g = (bFilter.lightColor >> 8) & 0xff;
      const bl = bFilter.lightColor & 0xff;
      bFilter.lightColor = (value << 16) | (g << 8) | bl;
    },
    overrideGet: (filter, defaultValue) => {
      if (filter) {
        return ((filter as BevelFilter).lightColor >> 16) & 0xff;
      }
      return defaultValue;
    },
  },
  bevelGreen: {
    filterName: 'bevel',
    defaultValue: 255,
    overrideSet: (value, filter) => {
      const bFilter = filter as BevelFilter;
      const r = (bFilter.lightColor >> 16) & 0xff;
      const bl = bFilter.lightColor & 0xff;
      bFilter.lightColor = (r << 16) | (value << 8) | bl;
    },
    overrideGet: (filter, defaultValue) => {
      if (filter) {
        return ((filter as BevelFilter).lightColor >> 8) & 0xff;
      }
      return defaultValue;
    },
  },
  bevelBlue: {
    filterName: 'bevel',
    defaultValue: 255,
    overrideSet: (value, filter) => {
      const bFilter = filter as BevelFilter;
      const r = (bFilter.lightColor >> 16) & 0xff;
      const g = (bFilter.lightColor >> 8) & 0xff;
      bFilter.lightColor = (r << 16) | (g << 8) | value;
    },
    overrideGet: (filter, defaultValue) => {
      if (filter) {
        return (filter as BevelFilter).lightColor & 0xff;
      }
      return defaultValue;
    },
  },

  // Advanced Bloom Filter Properties
  bloom: {
    filterName: 'bloom',
    filterProperty: 'bloomScale', // 'bloom' 公开属性映射到 bloomScale
    defaultValue: 0,
  },
  bloomBrightness: {
    filterName: 'bloom',
    filterProperty: 'brightness',
    defaultValue: 1,
  },
  bloomBlur: {
    filterName: 'bloom',
    filterProperty: 'blur',
    defaultValue: 0,
  },
  bloomThreshold: {
    filterName: 'bloom',
    filterProperty: 'threshold',
    defaultValue: 0,
  },
};

export class WebGALPixiContainer extends PIXI.Container {
  public containerFilters = new Map<string, PIXI.Filter>();
  private filterToName = new Map<PIXI.Filter, string>();

  private baseX = 0;
  private baseY = 0;

  public constructor() {
    super();
  }

  public removeFilterByName(filterName: string) {
    const filter = this.containerFilters.get(filterName);
    if (!filter || !this.filters) return;
    const idx = this.filters.indexOf(filter);
    if (idx !== -1) this.filters.splice(idx, 1);
    this.containerFilters.delete(filterName);
    this.filterToName.delete(filter);
  }

  // --- Position ---
  public override get x(): number {
    return (super.position?.x ?? 0) - this.baseX;
  }
  public override set x(v: number) {
    if (super.position) super.position.x = v + this.baseX;
  }
  public override get y(): number {
    return (super.position?.y ?? 0) - this.baseY;
  }
  public override set y(v: number) {
    if (super.position) super.position.y = v + this.baseY;
  }
  public setBaseX(x: number) {
    const old = this.x;
    this.baseX = x;
    this.x = old;
  }
  public setBaseY(y: number) {
    const old = this.y;
    this.baseY = y;
    this.y = old;
  }

  // --- Standard Filters ---
  public get blur(): number {
    return this._getPropertyValue('blur');
  }
  public set blur(v: number) {
    this._setPropertyValue('blur', v);
  }

  public get brightness(): number {
    return this._getPropertyValue('brightness');
  }
  public set brightness(v: number) {
    this._setPropertyValue('brightness', v);
  }
  public get contrast(): number {
    return this._getPropertyValue('contrast');
  }
  public set contrast(v: number) {
    this._setPropertyValue('contrast', v);
  }
  public get saturation(): number {
    return this._getPropertyValue('saturation');
  }
  public set saturation(v: number) {
    this._setPropertyValue('saturation', v);
  }
  public get gamma(): number {
    return this._getPropertyValue('gamma');
  }
  public set gamma(v: number) {
    this._setPropertyValue('gamma', v);
  }
  public get colorRed(): number {
    return this._getPropertyValue('colorRed');
  }
  public set colorRed(v: number) {
    this._setPropertyValue('colorRed', v);
  }
  public get colorGreen(): number {
    return this._getPropertyValue('colorGreen');
  }
  public set colorGreen(v: number) {
    this._setPropertyValue('colorGreen', v);
  }
  public get colorBlue(): number {
    return this._getPropertyValue('colorBlue');
  }
  public set colorBlue(v: number) {
    this._setPropertyValue('colorBlue', v);
  }

  // --- Boolean Filters ---
  public get oldFilm(): number {
    return this._getPropertyValue('oldFilm');
  }
  public set oldFilm(v: number) {
    this._setPropertyValue('oldFilm', v);
  }
  public get dotFilm(): number {
    return this._getPropertyValue('dotFilm');
  }
  public set dotFilm(v: number) {
    this._setPropertyValue('dotFilm', v);
  }
  public get reflectionFilm(): number {
    return this._getPropertyValue('reflectionFilm');
  }
  public set reflectionFilm(v: number) {
    this._setPropertyValue('reflectionFilm', v);
  }
  public get glitchFilm(): number {
    return this._getPropertyValue('glitchFilm');
  }
  public set glitchFilm(v: number) {
    this._setPropertyValue('glitchFilm', v);
  }
  public get rgbFilm(): number {
    return this._getPropertyValue('rgbFilm');
  }
  public set rgbFilm(v: number) {
    this._setPropertyValue('rgbFilm', v);
  }
  public get godrayFilm(): number {
    return this._getPropertyValue('godrayFilm');
  }
  public set godrayFilm(v: number) {
    this._setPropertyValue('godrayFilm', v);
  }

  // --- Newly Integrated Filters ---
  public get shockwaveFilter(): number {
    return this._getPropertyValue('shockwaveFilter');
  }
  public set shockwaveFilter(v: number) {
    this._setPropertyValue('shockwaveFilter', v);
  }

  public get radiusAlphaFilter(): number {
    return this._getPropertyValue('radiusAlphaFilter');
  }
  public set radiusAlphaFilter(v: number) {
    this._setPropertyValue('radiusAlphaFilter', v);
  }

  // --- Bevel Filter ---
  public get bevel(): number {
    return this._getPropertyValue('bevel');
  }
  public set bevel(v: number) {
    this._setPropertyValue('bevel', v);
  }

  public get bevelThickness(): number {
    return this._getPropertyValue('bevelThickness');
  }
  public set bevelThickness(v: number) {
    this._setPropertyValue('bevelThickness', v);
  }

  public get bevelRotation(): number {
    return this._getPropertyValue('bevelRotation');
  }
  public set bevelRotation(v: number) {
    this._setPropertyValue('bevelRotation', v);
  }

  public get bevelSoftness(): number {
    return this._getPropertyValue('bevelSoftness');
  }
  public set bevelSoftness(v: number) {
    this._setPropertyValue('bevelSoftness', v);
  }

  public get bevelRed(): number {
    return this._getPropertyValue('bevelRed');
  }
  public set bevelRed(v: number) {
    this._setPropertyValue('bevelRed', v);
  }

  public get bevelGreen(): number {
    return this._getPropertyValue('bevelGreen');
  }
  public set bevelGreen(v: number) {
    this._setPropertyValue('bevelGreen', v);
  }

  public get bevelBlue(): number {
    return this._getPropertyValue('bevelBlue');
  }
  public set bevelBlue(v: number) {
    this._setPropertyValue('bevelBlue', v);
  }

  // --- Advanced Bloom Filter ---
  public get bloom(): number {
    return this._getPropertyValue('bloom');
  }
  public set bloom(v: number) {
    this._setPropertyValue('bloom', v);
  }

  public get bloomBrightness(): number {
    return this._getPropertyValue('bloomBrightness');
  }
  public set bloomBrightness(v: number) {
    this._setPropertyValue('bloomBrightness', v);
  }

  public get bloomBlur(): number {
    return this._getPropertyValue('bloomBlur');
  }
  public set bloomBlur(v: number) {
    this._setPropertyValue('bloomBlur', v);
  }

  public get bloomThreshold(): number {
    return this._getPropertyValue('bloomThreshold');
  }
  public set bloomThreshold(v: number) {
    this._setPropertyValue('bloomThreshold', v);
  }

  private removeIfDefault(filterName: string) {
    const inst = this.containerFilters.get(filterName);
    const cfg = FILTER_CONFIGS[filterName];
    if (inst && cfg?.isDefault && cfg.isDefault(inst)) {
      this.removeFilterByName(filterName);
    }
  }

  private _getPropertyValue(propertyName: string): number {
    const propConfig = PROPERTY_CONFIGS[propertyName];
    if (!propConfig) {
      console.warn(`WebGALPixiContainer: Unknown property configuration for getter: ${propertyName}`);
      return 0;
    }
    if (propConfig.isBoolean) {
      return this.containerFilters.has(propConfig.filterName) ? 1 : 0;
    }
    const filterInstance = this.containerFilters.get(propConfig.filterName);
    if (propConfig.overrideGet) {
      return propConfig.overrideGet(filterInstance, propConfig.defaultValue, this);
    }
    if (filterInstance && propConfig.filterProperty) {
      return (filterInstance as any)[propConfig.filterProperty];
    }
    return propConfig.defaultValue;
  }

  private _setPropertyValue(propertyName: string, value: number): void {
    const propConfig = PROPERTY_CONFIGS[propertyName];
    if (!propConfig) {
      console.warn(`WebGALPixiContainer: Unknown property configuration for setter: ${propertyName}`);
      return;
    }
    if (propConfig.isBoolean) {
      if (value === 0 || value === undefined || value === null) {
        this.removeFilterByName(propConfig.filterName);
      } else {
        if (!this.containerFilters.has(propConfig.filterName)) {
          this.ensureFilterByName(propConfig.filterName);
        }
      }
      return;
    }
    if (value === propConfig.defaultValue && !this.containerFilters.has(propConfig.filterName)) {
      return;
    }
    const filterInstance = this.ensureFilterByName<any>(propConfig.filterName);
    if (propConfig.overrideSet) {
      propConfig.overrideSet(value, filterInstance, this);
    } else if (propConfig.filterProperty) {
      (filterInstance as any)[propConfig.filterProperty] = value;
    } else {
      console.warn(
        `WebGALPixiContainer: Property '${propertyName}' has neither overrideSet nor filterProperty defined for value setting.`,
      );
    }
    this.removeIfDefault(propConfig.filterName);
  }

  private insertFilterWithPriority(name: string, filter: PIXI.Filter) {
    const priority = FILTER_CONFIGS[name]?.priority ?? 0;

    if (!this.filters || this.filters.length === 0) {
      this.filters = [filter];
    } else {
      let insertIndex = this.filters.length;
      for (let i = 0; i < this.filters.length; i++) {
        const currentFilter = this.filters[i]!;
        const currentName = this.filterToName.get(currentFilter);
        if (currentName) {
          const currentPriority = FILTER_CONFIGS[currentName]?.priority ?? 0;
          if (priority > currentPriority) {
            insertIndex = i;
            break;
          }
        } else {
          if (priority > 0) {
            insertIndex = i;
            break;
          }
        }
      }
      this.filters.splice(insertIndex, 0, filter);
    }
    this.containerFilters.set(name, filter);
    this.filterToName.set(filter, name);
  }

  private ensureFilterByName<T extends PIXI.Filter>(filterName: string): T {
    let inst = this.containerFilters.get(filterName) as T | undefined;
    if (inst) return inst;
    const cfg = FILTER_CONFIGS[filterName];
    if (!cfg) throw new Error(`Unknown filter configuration: ${filterName}`);
    inst = cfg.create() as T;
    this.insertFilterWithPriority(filterName, inst);
    return inst;
  }
}
