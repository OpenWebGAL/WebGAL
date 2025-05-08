import { AlphaFilter } from '@pixi/filter-alpha';
import { BlurFilter } from '@pixi/filter-blur';
import { OldFilmFilter } from '@pixi/filter-old-film';
import { DotFilter } from '@pixi/filter-dot';
import { ReflectionFilter } from '@pixi/filter-reflection';
import { GlitchFilter } from '@pixi/filter-glitch';
import { RGBSplitFilter } from '@pixi/filter-rgb-split';
import { GodrayFilter } from '@pixi/filter-godray';
import * as PIXI from 'pixi.js';
import {
  RadiusAlphaFilter
} from '@/Core/controller/stage/pixi/shaders/RadiusAlphaFilter';
import { AdjustmentFilter, AdvancedBloomFilter, BevelFilter, ShockwaveFilter} from 'pixi-filters';

// 滤镜默认值
export const defaultBrightness = 1;
export const defaultContrast = 1;
export const defaultSaturation = 1;
export const defaultGamma = 1;
export const defaultColorRed = 255;
export const defaultColorGreen = 255;
export const defaultColorBlue = 255;
export const defaultBevel = 0;
export const defaultBevelThickness = 0;
export const defaultBevelRotation = 0;
export const defaultBevelRed = 255;
export const defaultBevelGreen = 255;
export const defaultBevelBlue = 255;
export const defaultBloom = 0;
export const defaultBloomBrightness = 1;
export const defaultBloomBlur = 0;
export const defaultBloomThreshold = 0;
export const defaultOldFilm = 0;
export const defaultRgbSplit = 0;
export const defaultGodray = 0;
export const defaultDot = 0;
export const defaultGlitch = 0;
export const defaultReflection = 0;
export const defaultBlur = 0;
export const defaultAlpha = 1;
export const defaultShockwave = 0;
export const defaultRadiusAlpha = 0;
// 滤镜键
enum FilterKey {
  Adjustment,
  Bevel,
  Bloom,
  OldFilm,
  RgbSplit,
  Godray,
  Dot,
  Glitch,
  Reflection,
  Blur,
  Alpha,
  Shockwave,
  RadiusAlpha,
}

export class FilterManager {
  // 滤镜字典
  private filterMap = new Map<FilterKey, PIXI.Filter | null>();
  // 是否需要更新滤镜数组
  public updateNeeded = false;

  constructor() {
    // 此处设置滤镜的固定顺序
    this.filterMap.set(FilterKey.Adjustment, null);
    this.filterMap.set(FilterKey.Bevel, null);
    this.filterMap.set(FilterKey.Godray, null);
    this.filterMap.set(FilterKey.Bloom, null)
    this.filterMap.set(FilterKey.OldFilm, null);
    this.filterMap.set(FilterKey.Glitch, null);
    this.filterMap.set(FilterKey.Dot, null);
    this.filterMap.set(FilterKey.RgbSplit, null);
    this.filterMap.set(FilterKey.Blur, null);
    this.filterMap.set(FilterKey.Shockwave, null);
    this.filterMap.set(FilterKey.RadiusAlpha, null);
    this.filterMap.set(FilterKey.Alpha, null);
  }

  // 更新排序后的滤镜数组
  public updateFilters(outFilters: PIXI.Filter[] | null) {
    if (outFilters === null) return;

    outFilters.splice(0, outFilters.length);
    this.filterMap.forEach((value, key, map)=>{
      if (value) {
        outFilters.push(value);
      }
    });
  }

  private addFilter(key: FilterKey, filter: PIXI.Filter) {
    this.filterMap.set(key, filter);
    this.updateNeeded = true;
  }

  private removeFilter(key: FilterKey){
    if (this.filterMap.get(key)) {
      this.filterMap.set(key, null);
      this.updateNeeded = true;
    }
  }

  //#region 透明度滤镜
  private getOrCreateAlphaFilter(createMode: boolean) {
    let filter = this.filterMap.get(FilterKey.Alpha) as AlphaFilter;
    if (filter === null && createMode) {
      filter = new AlphaFilter();
      filter.alpha = defaultAlpha;
      this.addFilter(FilterKey.Alpha, filter);
    }
    return filter;
  }

  private removeAlphaFilterIfNeeded(){
    const filter = this.getOrCreateAlphaFilter(false);
    if (
      filter
      && filter.alpha === defaultAlpha
    ) {
      this.removeFilter(FilterKey.Alpha);
    }
  }

  public get alpha(): number {
    const filter = this.getOrCreateAlphaFilter(false);
    return filter ? filter.alpha : defaultAlpha;
  }

  public set alpha(value: number) {
    if (value === defaultAlpha) {
      const filter = this.getOrCreateAlphaFilter(false);
      if (filter) {
        filter.alpha = value;
        this.removeAlphaFilterIfNeeded();
      }
    } else {
      const filter = this.getOrCreateAlphaFilter(true);
      filter.alpha = value;
    }
  }
  //#endregion 

  //#region 模糊滤镜
  private getOrCreateBlurFilter(createMode: boolean) {
    let filter = this.filterMap.get(FilterKey.Blur) as BlurFilter;
    if (filter === null && createMode) {
      filter = new BlurFilter();
      filter.blur = defaultBlur;
      this.addFilter(FilterKey.Blur, filter);
    }
    return filter;
  }

  private removeBlurFilterIfNeeded(){
    const filter = this.getOrCreateBlurFilter(false);
    if (
      filter
      && filter.blur === defaultBlur
    ) {
      this.removeFilter(FilterKey.Blur);
    }
  }

  public get blur(): number {
    const filter = this.getOrCreateBlurFilter(false);
    return filter ? filter.blur : defaultBlur;
  }

  public set blur(value: number) {
    if (value === defaultBlur) {
      const filter = this.getOrCreateBlurFilter(false);
      if (filter) {
        filter.blur = value;
        this.removeBlurFilterIfNeeded();
      }
    } else {
      const filter = this.getOrCreateBlurFilter(true);
      filter.blur = value;
    }
  }
  //#endregion 

  //#region 颜色调整滤镜
  private getOrCreateAdjustmentFilter(createMode: boolean) {
    let filter = this.filterMap.get(FilterKey.Adjustment) as AdjustmentFilter;
    if (filter === null && createMode) {
      filter = new AdjustmentFilter();
      filter.brightness = defaultBrightness;
      filter.contrast = defaultContrast;
      filter.saturation = defaultSaturation;
      filter.gamma = defaultGamma;
      filter.red = defaultColorRed / 255.0;
      filter.green = defaultColorGreen / 255.0;
      filter.blue = defaultColorBlue / 255.0;
      this.addFilter(FilterKey.Adjustment, filter);
    }
    return filter;
  }

  private removeAdjustmentFilterIfNeeded(){
    const filter = this.getOrCreateAdjustmentFilter(false);
    if (
      filter
      && filter.brightness === defaultBrightness
      && filter.contrast === defaultContrast
      && filter.saturation === defaultSaturation
      && filter.gamma === defaultGamma
      && filter.red === defaultColorRed / 255.0
      && filter.green === defaultColorGreen / 255.0
      && filter.blue === defaultColorBlue / 255.0
    ) {
      this.removeFilter(FilterKey.Adjustment);
    }
  }

  public get brightness(): number {
    const filter = this.getOrCreateAdjustmentFilter(false);
    return filter ? filter.brightness : defaultBrightness;
  }

  public set brightness(value: number) {
    if (value === defaultBrightness) {
      const filter = this.getOrCreateAdjustmentFilter(false);
      if (filter) {
        filter.brightness = value;
        this.removeAdjustmentFilterIfNeeded();
      }
    } else {
      const filter = this.getOrCreateAdjustmentFilter(true);
      filter.brightness = value;
    }
  }

  public get contrast(): number {
    const filter = this.getOrCreateAdjustmentFilter(false);
    return filter ? filter.contrast : defaultContrast;
  }

  public set contrast(value: number) {
    if (value === defaultContrast) {
      const filter = this.getOrCreateAdjustmentFilter(false);
      if (filter) {
        filter.contrast = value;
        this.removeAdjustmentFilterIfNeeded();
      }
    } else {
      const filter = this.getOrCreateAdjustmentFilter(true);
      filter.contrast = value;
    }
  }

  public get saturation(): number {
    const filter = this.getOrCreateAdjustmentFilter(false);
    return filter ? filter.saturation : defaultSaturation;
  }

  public set saturation(value: number) {
    if (value === defaultSaturation) {
      const filter = this.getOrCreateAdjustmentFilter(false);
      if (filter) {
        filter.saturation = value;
        this.removeAdjustmentFilterIfNeeded();
      }
    } else {
      const filter = this.getOrCreateAdjustmentFilter(true);
      filter.saturation = value;
    }
  }

  public get gamma(): number {
    const filter = this.getOrCreateAdjustmentFilter(false);
    return filter ? filter.gamma : defaultGamma;
  }

  public set gamma(value: number) {
    if (value === defaultGamma) {
      const filter = this.getOrCreateAdjustmentFilter(false);
      if (filter) {
        filter.gamma = value;
        this.removeAdjustmentFilterIfNeeded();
      }
    } else {
      const filter = this.getOrCreateAdjustmentFilter(true);
      filter.gamma = value;
    }
  }

  public get colorRed(): number {
    const filter = this.getOrCreateAdjustmentFilter(false);
    return filter ? filter.red * 255.0 : defaultColorRed;
  }

  public set colorRed(value: number) {
    if (value === defaultColorRed) {
      const filter = this.getOrCreateAdjustmentFilter(false);
      if (filter) {
        filter.red = value / 255.0;
        this.removeAdjustmentFilterIfNeeded();
      }
    } else {
      const filter = this.getOrCreateAdjustmentFilter(true);
      filter.red = value / 255.0;
    }
  }

  public get colorGreen(): number {
    const filter = this.getOrCreateAdjustmentFilter(false);
    return filter ? filter.green * 255.0 : defaultColorGreen;
  }

  public set colorGreen(value: number) {
    if (value === defaultColorGreen) {
      const filter = this.getOrCreateAdjustmentFilter(false);
      if (filter) {
        filter.green = value / 255.0;
        this.removeAdjustmentFilterIfNeeded();
      }
    } else {
      const filter = this.getOrCreateAdjustmentFilter(true);
      filter.green = value / 255.0;
    }
  }

  public get colorBlue(): number {
    const filter = this.getOrCreateAdjustmentFilter(false);
    return filter ? filter.blue * 255.0 : defaultColorBlue;
  }

  public set colorBlue(value: number) {
    if (value === defaultColorBlue) {
      const filter = this.getOrCreateAdjustmentFilter(false);
      if (filter) {
        filter.blue = value / 255.0;
        this.removeAdjustmentFilterIfNeeded();
      }
    } else {
      const filter = this.getOrCreateAdjustmentFilter(true);
      filter.blue = value / 255.0;
    }
  }
  //#endregion

  //#region 泛光滤镜
  private getOrCreateBloomFilter(createMode: boolean) {
    let filter = this.filterMap.get(FilterKey.Bloom) as AdvancedBloomFilter;
    if (filter === null && createMode) {
      filter = new AdvancedBloomFilter();
      filter.bloomScale = defaultBloom;
      filter.brightness = defaultBloomBrightness;
      filter.blur = defaultBloomBlur;
      filter.threshold = defaultBloomThreshold;
      this.addFilter(FilterKey.Bloom, filter);
    }
    return filter;
  }

  private removeBloomFilterIfNeeded(){
    const filter = this.getOrCreateBloomFilter(false);
    if (
      filter
      && filter.bloomScale === defaultBloom
      && filter.brightness == defaultBloomBrightness
      && filter.blur === defaultBloomBlur
      && filter.threshold === defaultBloomThreshold
    ) {
      this.removeFilter(FilterKey.Bloom);
    }
  }

  public get bloom(): number {
    const filter = this.getOrCreateBloomFilter(false);
    return filter ? filter.bloomScale : defaultBloom;
  }

  public set bloom(value: number) {
    if (value === defaultBloom) {
      const filter = this.getOrCreateBloomFilter(false);
      if (filter) {
        filter.bloomScale = value;
        this.removeBloomFilterIfNeeded();
      }
    } else {
      const filter = this.getOrCreateBloomFilter(true);
      filter.bloomScale = value;
    }
  }

  public get bloomBrightness(): number {
    const filter = this.getOrCreateBloomFilter(false);
    return filter ? filter.brightness : defaultBloomBrightness;
  }

  public set bloomBrightness(value: number) {
    if (value === defaultBloomBrightness) {
      const filter = this.getOrCreateBloomFilter(false);
      if (filter) {
        filter.brightness = value;
        this.removeBloomFilterIfNeeded();
      }
    } else {
      const filter = this.getOrCreateBloomFilter(true);
      filter.brightness = value;
    }
  }

  public get bloomBlur(): number {
    const filter = this.getOrCreateBloomFilter(false);
    return filter ? filter.blur : defaultBloomBlur;
  }

  public set bloomBlur(value: number) {
    if (value === defaultBloomBlur) {
      const filter = this.getOrCreateBloomFilter(false);
      if (filter) {
        filter.blur = value;
        this.removeBloomFilterIfNeeded();
      }
    } else {
      const filter = this.getOrCreateBloomFilter(true);
      filter.blur = value;
    }
  }

  public get bloomThreshold(): number {
    const filter = this.getOrCreateBloomFilter(false);
    return filter ? filter.threshold : defaultBloomThreshold;
  }

  public set bloomThreshold(value: number) {
    if (value === defaultBloomThreshold) {
      const filter = this.getOrCreateBloomFilter(false);
      if (filter) {
        filter.threshold = value;
        this.removeBloomFilterIfNeeded();
      }
    } else {
      const filter = this.getOrCreateBloomFilter(true);
      filter.threshold = value;
    }
  }
  //#endregion 

  //#region 倒角滤镜
  private getOrCreateBevelFilter(createMode: boolean) {
    let filter = this.filterMap.get(FilterKey.Bevel) as BevelFilter;
    if (filter === null && createMode) {
      filter = new BevelFilter();
      filter.lightAlpha = defaultBevel;
      filter.thickness = defaultBevelThickness;
      filter.rotation = defaultBevelRotation;
      filter.lightColor = (defaultBevelRed << 16) | (defaultBevelGreen << 8) | defaultBevelBlue;
      filter.shadowAlpha = 0;
      this.addFilter(FilterKey.Bevel, filter);
    }
    return filter;
  }

  private removeBevelFilterIfNeeded(){
    const filter = this.getOrCreateBevelFilter(false);
    if (
      filter
      && filter.lightAlpha === defaultBevel
      && filter.thickness === defaultBevelThickness
      && filter.rotation === defaultBevelRotation
      && filter.lightColor === ((defaultBevelRed << 16) | (defaultBevelGreen << 8) | defaultBevelBlue)
    ) {
      this.removeFilter(FilterKey.Bevel);
    }
  }

  public get bevel(): number {
    const filter = this.getOrCreateBevelFilter(false);
    return filter ? filter.lightAlpha : defaultBevel;
  }

  public set bevel(value: number) {
    if (value === defaultBevel) {
      const filter = this.getOrCreateBevelFilter(false);
      if (filter) {
        filter.lightAlpha = value;
        this.removeBevelFilterIfNeeded();
      }
    } else {
      const filter = this.getOrCreateBevelFilter(true);
      filter.lightAlpha = value;
    }
  }

  public get bevelThickness(): number {
    const filter = this.getOrCreateBevelFilter(false);
    return filter ? filter.thickness : defaultBevelThickness;
  }

  public set bevelThickness(value: number) {
    if (value === defaultBevelThickness) {
      const filter = this.getOrCreateBevelFilter(false);
      if (filter) {
        filter.thickness = value;
        this.removeBevelFilterIfNeeded();
      }
    } else {
      const filter = this.getOrCreateBevelFilter(true);
      filter.thickness = value;
    }
  }

  public get bevelRotation(): number {
    const filter = this.getOrCreateBevelFilter(false);
    return filter ? filter.rotation : defaultBevelRotation;
  }

  public set bevelRotation(value: number) {
    if (value === defaultBevelRotation) {
      const filter = this.getOrCreateBevelFilter(false);
      if (filter) {
        filter.rotation = value;
        this.removeBevelFilterIfNeeded();
      }
    } else {
      const filter = this.getOrCreateBevelFilter(true);
      filter.rotation = value;
    }
  }

  public get bevelRed(): number {
    const filter = this.getOrCreateBevelFilter(false);
    if (filter){
      const color = filter.lightColor;
      const hexStr = color.toString(16).padStart(6, "0");
      return parseInt(hexStr.substring(0, 2), 16);
    } else {
      return defaultBevelRed;
    }
  }

  public set bevelRed(value: number) {
    if (value === defaultBevelRed) {
      const filter = this.getOrCreateBevelFilter(false);
      if (filter) {
        filter.lightColor = (value << 16) | (this.bevelGreen << 8) | this.bevelBlue;
        this.removeBevelFilterIfNeeded();
      }
    } else {
      const filter = this.getOrCreateBevelFilter(true);
      filter.lightColor = (value << 16) | (this.bevelGreen << 8) | this.bevelBlue;
    }
  }

  public get bevelGreen(): number {
    const filter = this.getOrCreateBevelFilter(false);
    if (filter){
      const color = filter.lightColor;
      const hexStr = color.toString(16).padStart(6, "0");
      return parseInt(hexStr.substring(2, 4), 16);
    } else {
      return defaultBevelGreen;
    }
  }

  public set bevelGreen(value: number) {
    if (value === defaultBevelGreen) {
      const filter = this.getOrCreateBevelFilter(false);
      if (filter) {
        filter.lightColor = (this.bevelRed << 16) | (value << 8) | this.bevelBlue;
        this.removeBevelFilterIfNeeded();
      }
    } else {
      const filter = this.getOrCreateBevelFilter(true);
      filter.lightColor = (this.bevelRed << 16) | (value << 8) | this.bevelBlue;
    }
  }

  public get bevelBlue(): number {
    const filter = this.getOrCreateBevelFilter(false);
    if (filter){
      const color = filter.lightColor;
      const hexStr = color.toString(16).padStart(6, "0");
      return parseInt(hexStr.substring(4, 6), 16);
    } else {
      return defaultBevelBlue;
    }
  }

  public set bevelBlue(value: number) {
    if (value === defaultBevelBlue) {
      const filter = this.getOrCreateBevelFilter(false);
      if (filter) {
        filter.lightColor = (this.bevelRed << 16) | (this.bevelGreen << 8) | value;
        this.removeBevelFilterIfNeeded();
      }
    } else {
      const filter = this.getOrCreateBevelFilter(true);
      filter.lightColor = (this.bevelRed << 16) | (this.bevelGreen << 8) | value;
    }
  }
  //#endregion 

  //#region 老电影滤镜
  private getOrCreateOldFilmFilter(createMode: boolean): OldFilmFilter {
    let filter = this.filterMap.get(FilterKey.OldFilm) as OldFilmFilter;
    if (filter === null && createMode) {
      filter = new OldFilmFilter();
      this.addFilter(FilterKey.OldFilm, filter);
    }
    return filter;
  }

  public get oldFilm(): number {
    const filter = this.getOrCreateOldFilmFilter(false);
    return filter ? 1 : 0;
  }

  public set oldFilm(value: number) {
    if (value === defaultOldFilm) {
      this.removeFilter(FilterKey.OldFilm);
    } else {
      this.getOrCreateOldFilmFilter(true);
    }
  }
  //#endregion 

  //#region RGB 分离滤镜
  private getOrCreateRGBSplitFilter(createMode: boolean) {
    let filter = this.filterMap.get(FilterKey.RgbSplit) as RGBSplitFilter;
    if (filter === null && createMode) {
      filter = new RGBSplitFilter();
      this.addFilter(FilterKey.RgbSplit, filter);
    }
    return filter;
  }

  public get rgbSplit(): number {
    const filter = this.getOrCreateRGBSplitFilter(false);
    return filter ? 1 : 0;
  }

  public set rgbSplit(value: number) {
    if (value === defaultRgbSplit) {
      this.removeFilter(FilterKey.RgbSplit);
    } else {
      this.getOrCreateRGBSplitFilter(true);
    }
  }
  //#endregion

  //#region 光辉滤镜
  private getOrCreateGodrayFilter(createMode: boolean) {
    let filter = this.filterMap.get(FilterKey.Godray) as GodrayFilter;
    if (filter === null && createMode) {
      filter = new GodrayFilter();
      this.addFilter(FilterKey.Godray, filter);
    }
    return filter;
  }

  public get godray(): number {
    const filter = this.getOrCreateGodrayFilter(false);
    return filter ? 1 : 0;
  }

  public set godray(value: number) {
    if (value === defaultGodray) {
      this.removeFilter(FilterKey.Godray);
    } else {
      this.getOrCreateGodrayFilter(true);
    }
  }
  //#endregion

  //#region 点状滤镜
  private getOrCreateDotFilter(createMode: boolean) {
    let filter = this.filterMap.get(FilterKey.Dot) as DotFilter;
    if (filter === null && createMode) {
      filter = new DotFilter();
      this.addFilter(FilterKey.Dot, filter);
    }
    return filter;
  }

  public get dot(): number {
    const filter = this.getOrCreateDotFilter(false);
    return filter ? 1 : 0;
  }

  public set dot(value: number) {
    if (value === defaultDot) {
      this.removeFilter(FilterKey.Dot);
    } else {
      this.getOrCreateDotFilter(true);
    }
  }
  //#endregion

  //#region 故障滤镜
  private getOrCreateGlitchFilter(createMode: boolean) {
    let filter = this.filterMap.get(FilterKey.Glitch) as GlitchFilter;
    if (filter === null && createMode) {
      filter = new GlitchFilter();
      this.addFilter(FilterKey.Glitch, filter);
    }
    return filter;
  }

  public get glitch(): number {
    const filter = this.getOrCreateGlitchFilter(false);
    return filter ? 1 : 0;
  }

  public set glitch(value: number) {
    if (value === defaultGlitch) {
      this.removeFilter(FilterKey.Glitch);
    } else {
      this.getOrCreateGlitchFilter(true);
    }
  }
  //#endregion

  //#region 反射滤镜
  private getOrCreateReflectionFilter(createMode: boolean) {
    let filter = this.filterMap.get(FilterKey.Reflection) as ReflectionFilter;
    if (filter === null && createMode) {
      filter = new ReflectionFilter();
      this.addFilter(FilterKey.Reflection, filter);
    }
    return filter;
  }

  public get reflection(): number {
    const filter = this.getOrCreateReflectionFilter(false);
    return filter ? 1 : 0;
  }

  public set reflection(value: number) {
    if (value === defaultReflection) {
      this.removeFilter(FilterKey.Reflection);
    } else {
      this.getOrCreateReflectionFilter(true);
    }
  }
  //#endregion

  //#region 冲击波滤镜
  private getOrCreateShockwaveFilter(createMode: boolean) {
    let filter = this.filterMap.get(FilterKey.Shockwave) as ShockwaveFilter;
    if (filter === null && createMode) {
      filter = new ShockwaveFilter([1280, 720]);
      filter.time = defaultShockwave;
      this.addFilter(FilterKey.Shockwave, filter)
    }
    return filter;
  }

  private removeShockwaveFilterIfNeeded() {
    const filter = this.getOrCreateShockwaveFilter(false);
    if (
      filter
      && filter.time === defaultShockwave
    ) {
      this.removeFilter(FilterKey.Shockwave);
    }
  }
  
  public get shockwave(): number {
    const filter = this.getOrCreateShockwaveFilter(false);
    return filter ? filter.time : defaultShockwave;
  }
  
  public set shockwave(value: number) {
    if (value === defaultShockwave) {
      const filter = this.getOrCreateShockwaveFilter(false);
      if (filter) {
        filter.time = value;
        // this.removeShockwaveFilterIfNeeded();
      }
    } else {
      const filter = this.getOrCreateShockwaveFilter(true);
      filter.time = value;
    }
  }
  //#endregion

  //#region 径向渐变透明滤镜
  private getOrCreateRadiusAlphaFilter(createMode: boolean) {
    let filter = this.filterMap.get(FilterKey.RadiusAlpha) as RadiusAlphaFilter;
    if (filter === null && createMode) {
      filter = new RadiusAlphaFilter(new PIXI.Point(0.5, 0.5), defaultRadiusAlpha);
      filter.radius = defaultRadiusAlpha;
      this.addFilter(FilterKey.RadiusAlpha, filter)
    }
    return filter;
  }

  private removeRadiusAlphaFilterIfNeeded() {
    const filter = this.getOrCreateRadiusAlphaFilter(false);
    if (
      filter
      && filter.radius === defaultRadiusAlpha
    ) {
      this.removeFilter(FilterKey.RadiusAlpha);
    }
  }
  
  public get radiusAlpha(): number {
    const filter = this.getOrCreateRadiusAlphaFilter(false);
    return filter ? filter.radius : defaultRadiusAlpha;
  }
  
  public set radiusAlpha(value: number) {
    if (value === defaultRadiusAlpha) {
      const filter = this.getOrCreateRadiusAlphaFilter(false);
      if (filter) {
        filter.radius = value;
        // this.removeRadiusAlphaFilterIfNeeded();
      }
    } else {
      const filter = this.getOrCreateRadiusAlphaFilter(true);
      filter.radius = value;
    }
  }
  //#endregion
}