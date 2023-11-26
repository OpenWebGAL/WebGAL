export function setEbg(url: string) {
  const ebg = document.getElementById('ebg');
  if (ebg) {
    ebg.style.backgroundImage = `url("${url}")`;
  }
}
