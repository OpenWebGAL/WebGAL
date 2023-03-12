export function setEbg(url: string) {
  const ebg = document.getElementById('ebg');
  ebg!.style.backgroundImage = `url("${url}")`;
}
