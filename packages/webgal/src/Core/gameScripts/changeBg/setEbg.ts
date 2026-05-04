import { DEFAULT_BG_IN_DURATION } from '@/Core/constants';

let previousImageUrl = '';
let animation: Animation | null = null;

export function setEbg(url: string, duration = DEFAULT_BG_IN_DURATION, ease = 'ease-in-out') {
  const ebg = document.getElementById('ebg') as HTMLElement;
  if (ebg) {
    ebg.style.backgroundImage = getValidBgImage(url);
  }
  const ebgOverlay = document.getElementById('ebgOverlay') as HTMLElement;
  if (ebgOverlay) {
    ebgOverlay.style.backgroundImage = getValidBgImage(previousImageUrl);
    if (animation) {
      animation.cancel();
    }
    animation = ebgOverlay.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: duration,
      easing: ease,
    });
  }
  previousImageUrl = url;
}

function getValidBgImage(url: string): string {
  if (url === '') {
    return 'none';
  } else {
    return `url("${url}")`;
  }
}

