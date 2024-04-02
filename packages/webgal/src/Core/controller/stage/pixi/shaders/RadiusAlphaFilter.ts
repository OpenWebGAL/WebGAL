import * as PIXI from 'pixi.js';
import { WebGALPixiContainer } from '@/Core/controller/stage/pixi/WebGALPixiContainer';

const INIT_RAD = 0;
const FILTER_NAME = 'radiusAlphaFilter';

class RadiusAlphaFilter extends PIXI.Filter {
  public constructor(center: PIXI.Point, radius: number) {
    const fragmentShader = `
// 半径透明度的fragment shader
precision mediump float;

uniform sampler2D uSampler;  // 输入纹理
varying vec2 vTextureCoord;  // 当前片元的纹理坐标
uniform vec2 center;         // 圆心坐标
uniform float radius;        // 圆的半径

void main(void) {
    vec4 color = texture2D(uSampler, vTextureCoord);

    // 计算屏幕宽高比
    float aspect = 16.0 / 9.0;

    // 根据宽高比校正纹理坐标
    vec2 aspectCorrectCoord = vTextureCoord;
    aspectCorrectCoord.x *= aspect;

    // 计算片元到圆心的距离
    float dist = distance(aspectCorrectCoord, center * vec2(aspect, 1.0));

    // 使用smoothstep函数计算alpha值,实现边缘羽化效果
    float alpha = smoothstep(radius, radius + 0.05, dist);

    // 输出最终颜色
    gl_FragColor = color * (1.0 - alpha);
}
    `; // 填入上面的fragment shader代码
    super(null as any, fragmentShader);
    this.uniforms.center = [center.x, center.y];
    this.uniforms.radius = radius;
  }

  public set center(value: PIXI.Point) {
    this.uniforms.center = [value.x, value.y];
  }

  public get center(): PIXI.Point {
    return new PIXI.Point(this.uniforms.center[0], this.uniforms.center[1]);
  }

  public set radius(value: number) {
    this.uniforms.radius = value;
  }

  public get radius(): number {
    return this.uniforms.radius;
  }
}

export function getOrCreateRadiusAlphaFilterImpl(container: WebGALPixiContainer, createMode: boolean) {
  const shockwaveFilterFromMap = container.containerFilters.get(FILTER_NAME);
  if (shockwaveFilterFromMap) {
    return shockwaveFilterFromMap;
  } else {
    if (createMode) {
      const shockwaveFilter = new RadiusAlphaFilter(new PIXI.Point(0.5, 0.5), INIT_RAD);
      shockwaveFilter.radius = INIT_RAD;
      container.addFilter(shockwaveFilter);
      container.containerFilters.set(FILTER_NAME, shockwaveFilter);
      return shockwaveFilter;
    }
  }
}

export function getRadiusAlphaFilter(container: WebGALPixiContainer) {
  if (container.getOrCreateShockwaveFilter(false)) {
    const shockwaveFilter = container.getOrCreateRadiusAlphaFilter() as RadiusAlphaFilter;
    return shockwaveFilter.radius;
  }
  return INIT_RAD;
}

export function setRadiusAlphaFilter(container: WebGALPixiContainer, value: number) {
  /**
   * 如果是0，就移除这个滤镜
   */
  if (value === 0) {
    container.removeFilter(FILTER_NAME);
  } else {
    const shockwaveFilter = container.getOrCreateRadiusAlphaFilter() as RadiusAlphaFilter;
    if (shockwaveFilter) shockwaveFilter.radius = value;
  }
}
