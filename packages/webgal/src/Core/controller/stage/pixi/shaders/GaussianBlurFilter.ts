import * as PIXI from 'pixi.js';

/**
 * 没调好，不要用
 */
export class GaussianBlurFilter extends PIXI.Filter {
  public constructor(blurRadius: number) {
    const fragmentShader = `
    // 高斯模糊的fragment shader
precision mediump float;

// 传入的纹理
uniform sampler2D uSampler;
// 当前片元的位置
varying vec2 vTextureCoord;
// 高斯模糊半径
uniform float blurRadius;

void main(void) {
    // 计算高斯模糊
    float total = 0.0;
    vec4 sum = vec4(0.0);
    for (float x = -blurRadius; x <= blurRadius; x++) {
        for (float y = -blurRadius; y <= blurRadius; y++) {
            float weight = exp(-0.5 * (x * x + y * y) / (blurRadius * blurRadius));
            vec4 sample = texture2D(uSampler, vTextureCoord + vec2(x, y) / resolution);
            sum += sample * weight;
            total += weight;
        }
    }

    // 输出模糊后的颜色值
    gl_FragColor = sum / total;
}

    `; // 这里填入上面的fragment shader代码
    super(undefined, fragmentShader);

    this.uniforms.blurRadius = blurRadius;
  }

  public set blurRadius(value: number) {
    this.uniforms.blurRadius = value;
  }

  public get blurRadius(): number {
    return this.uniforms.blurRadius;
  }
}
