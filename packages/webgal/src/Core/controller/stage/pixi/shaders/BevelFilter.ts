import { Filter, FilterState, FilterSystem, RenderTexture } from '@pixi/core';
import { DEG_TO_RAD } from '@pixi/math';
import { rgb2hex, hex2rgb } from '@pixi/utils';
import { MotionBlurFilter } from 'pixi-filters';
import { CLEAR_MODES } from 'pixi.js';

interface BevelFilterOptions {
  rotation: number;
  thickness: number;
  lightColor: number;
  lightAlpha: number;
  shadowColor: number;
  shadowAlpha: number;
}

/**
 * Bevel Filter.<br>
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @see {@link https://www.npmjs.com/package/@pixi/filter-bevel|@pixi/filter-bevel}
 * @see {@link https://www.npmjs.com/package/pixi-filters|pixi-filters}
 */
class BevelFilter extends Filter {
  private _thickness = 2;
  private _angle = 0;
  private _softness = 0;

  private _blurFilter = new MotionBlurFilter();

  /**
   * @param {object} [options] - The optional parameters of the filter.
   * @param {number} [options.rotation = 45] - The angle of the light in degrees.
   * @param {number} [options.thickness = 2] - The tickness of the bevel.
   * @param {number} [options.lightColor = 0xffffff] - Color of the light.
   * @param {number} [options.lightAlpha = 0.7] - Alpha of the light.
   * @param {number} [options.shadowColor = 0x000000] - Color of the shadow.
   * @param {number} [options.shadowAlpha = 0.7] - Alpha of the shadow.
   */
  public constructor(options?: Partial<BevelFilterOptions>) {
    const fragment = `precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform sampler2D mask;
uniform vec4 filterArea;

uniform float transformX;
uniform float transformY;
uniform vec3 lightColor;
uniform float lightAlpha;
uniform vec3 shadowColor;
uniform float shadowAlpha;

void main(void) {
    vec2 transform = vec2(1.0 / filterArea) * vec2(transformX, transformY);
    vec4 color = texture2D(uSampler, vTextureCoord);
    float light = texture2D(mask, vTextureCoord - transform).a;
    float shadow = texture2D(mask, vTextureCoord + transform).a;

    // color.rgb = mix(color.rgb, lightColor, clamp((color.a - light) * lightAlpha, 0.0, 1.0));
    // color.rgb = mix(color.rgb, shadowColor, clamp((color.a - shadow) * shadowAlpha, 0.0, 1.0));

    // 滤色
    color.rgb = mix(color.rgb, vec3(1.0) - (vec3(1.0) - color.rgb) * (vec3(1.0) - lightColor), clamp((color.a - light) * lightAlpha, 0.0, 1.0));
    // 正片叠底(相乘)
    color.rgb = mix(color.rgb, color.rgb * shadowColor, clamp((color.a - shadow) * shadowAlpha, 0.0, 1.0));

    gl_FragColor = vec4(color.rgb, color.a);
}`;
    super(null as any, fragment);

    this.uniforms.lightColor = new Float32Array(3);
    this.uniforms.shadowColor = new Float32Array(3);

    Object.assign(
      this,
      {
        rotation: 45,
        thickness: 2,
        lightColor: 0xffffff,
        lightAlpha: 0.7,
        shadowColor: 0x000000,
        shadowAlpha: 0.7,
      },
      options,
    );

    // Workaround: https://github.com/pixijs/filters/issues/230
    // applies correctly only if there is at least a single-pixel padding with alpha=0 around an image
    // To solve this problem, a padding of 1 put on the filter should suffice
    this.padding = 1;

    this._blurFilter.kernelSize = 11;
  }

  // eslint-disable-next-line max-params
  public apply(
    filterManager: FilterSystem,
    input: RenderTexture,
    output: RenderTexture,
    clearMode?: CLEAR_MODES,
    _currentState?: FilterState,
  ): void {
    if (this.softness > 0) {
      const blurTexture = filterManager.getFilterTexture();
      this._blurFilter.apply(filterManager, input, blurTexture, CLEAR_MODES.YES);

      this.uniforms.mask = blurTexture;
      filterManager.applyFilter(this, input, output, clearMode);

      filterManager.returnFilterTexture(blurTexture);
    } else {
      this.uniforms.mask = input;
      filterManager.applyFilter(this, input, output, clearMode);
    }
  }

  /**
   * Update the transform matrix of offset angle.
   * @private
   */
  private _updateTransform() {
    this.uniforms.transformX = this._thickness * Math.cos(this._angle);
    this.uniforms.transformY = this._thickness * Math.sin(this._angle);
  }

  private _updateBlur() {
    this._blurFilter.velocity.set(
      Math.cos(this._angle) * this.thickness * this.softness * -1,
      Math.sin(this._angle) * this.thickness * this.softness * -1,
    );
  }

  /**
   * The angle of the light in degrees.
   * @default 45
   */
  public get rotation(): number {
    return this._angle / DEG_TO_RAD;
  }
  public set rotation(value: number) {
    this._angle = value * DEG_TO_RAD;
    this._updateTransform();
    this._updateBlur();
  }

  /**
   * The tickness of the bevel.
   * @default 2
   */
  public get thickness(): number {
    return this._thickness;
  }
  public set thickness(value: number) {
    this._thickness = value;
    this._updateTransform();
    this._updateBlur();
  }

  /**
   * The tickness of the bevel. Range [0, 1]
   * @default 0
   */
  public get softness(): number {
    return this._softness;
  }
  public set softness(value: number) {
    this._softness = Math.min(Math.max(value, 0), 1);
    this._updateBlur();
  }

  /**
   * Color of the light.
   * @default 0xffffff
   */
  public get lightColor(): number {
    return rgb2hex(this.uniforms.lightColor);
  }
  public set lightColor(value: number) {
    hex2rgb(value, this.uniforms.lightColor);
  }

  /**
   * Alpha of the light.
   * @default 0.7
   */
  public get lightAlpha(): number {
    return this.uniforms.lightAlpha;
  }
  public set lightAlpha(value: number) {
    this.uniforms.lightAlpha = value;
  }

  /**
   * Color of the shadow.
   * @default 0x000000
   */
  public get shadowColor(): number {
    return rgb2hex(this.uniforms.shadowColor);
  }
  public set shadowColor(value: number) {
    hex2rgb(value, this.uniforms.shadowColor);
  }

  /**
   * Alpha of the shadow.
   * @default 0.7
   */
  public get shadowAlpha(): number {
    return this.uniforms.shadowAlpha;
  }
  public set shadowAlpha(value: number) {
    this.uniforms.shadowAlpha = value;
  }
}

export { BevelFilter };
export type { BevelFilterOptions };
