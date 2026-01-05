import { DEFAULT_BG_IN_DURATION } from '@/Core/constants';

let previousImageUrl = '';

export function setEbg(url: string, duration = DEFAULT_BG_IN_DURATION) {
  const ebg = document.getElementById('ebg') as HTMLElement;
  if (ebg) {
    ebg.style.backgroundImage = `url("${url}")`;
  }
  const ebgOverlay = document.getElementById('ebgOverlay') as HTMLElement;
  if (ebgOverlay) {
    ebgOverlay.style.backgroundImage = `url("${previousImageUrl}")`;
    ebgOverlay.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: duration,
      easing: 'ease-in-out',
    });
  }
  previousImageUrl = url;
}
