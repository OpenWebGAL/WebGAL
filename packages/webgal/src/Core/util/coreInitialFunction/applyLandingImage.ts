import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';

const DEFAULT_LANDING_GRADIENT = 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)';

/**
 * 根据配置更新落地页：
 * 配置了自定义落地启动图时替换背景并隐藏默认提示文案；未配置时恢复灰白渐变并展示提示文案。
 */
export function applyLandingImage(landingImg?: string): void {
  const initialBg = document.querySelector<HTMLElement>('.title-enter__initial-background');
  const centerText = document.querySelector<HTMLElement>('.title-enter-container__center-text');
  const trimmed = typeof landingImg === 'string' ? landingImg.trim() : '';

  if (trimmed) {
    const imageUrl = assetSetter(trimmed, fileType.background).replace(/"/g, '\\"');
    if (initialBg) {
      initialBg.style.backgroundImage = `url("${imageUrl}"), ${DEFAULT_LANDING_GRADIENT}`;
    }
    if (centerText) {
      centerText.style.display = 'none';
    }
    return;
  }

  if (initialBg) {
    initialBg.style.backgroundImage = '';
  }
  if (centerText) {
    centerText.style.display = 'flex';
  }
}
