/**
 * 让 modern-css-reset 的 reduced-motion 压制跳过 WebGAL 演出子树。
 *
 * modern-css-reset 在 prefers-reduced-motion: reduce 下用
 * `*, *::before, *::after { animation-duration: .01ms !important; ... }`
 * 压制所有动画，会关掉 intro 等演出动画。演出是叙事内容，不应被系统设置关闭；
 * 舞台之外的 UI 仍应尊重用户偏好。
 *
 * 构建期改写该依赖的 CSS，把压制选择器的作用域限定到舞台之外，
 * 使依赖继续由包管理器跟踪。演出子树由 Stage 根节点的 data-webgal-stage 标记界定。
 */

const TARGET = 'modern-css-reset';

// modern-css-reset 的压制规则选择器（压缩后的精确文本）。
const GLOBAL_SELECTOR = '*,*::before,*::after{animation-duration:';

const SCOPED_SELECTOR =
  '*:not([data-webgal-stage]):not([data-webgal-stage] *),' +
  '*:not([data-webgal-stage]):not([data-webgal-stage] *)::before,' +
  '*:not([data-webgal-stage]):not([data-webgal-stage] *)::after{animation-duration:';

export function scopeResetMotion() {
  return {
    name: 'webgal-scope-reset-motion',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (!id.includes(TARGET) || !id.endsWith('.css')) return null;

      if (!code.includes(GLOBAL_SELECTOR)) {
        this.warn(
          `[${TARGET}] 未找到 reduced-motion 的动画压制规则，演出动画可能被系统设置关闭。` +
            `请检查依赖版本是否改变了 reset.css 的内容。`,
        );
        return null;
      }

      return { code: code.replace(GLOBAL_SELECTOR, SCOPED_SELECTOR), map: null };
    },
  };
}

export default scopeResetMotion;
