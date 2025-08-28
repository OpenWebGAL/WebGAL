export function setEbg(url: string) {
  const ebg = document.querySelector('.html-body__effect-background') as HTMLElement;
  if (ebg) {
    ebg.style.backgroundImage = `url("${url}")`;
  }
}
