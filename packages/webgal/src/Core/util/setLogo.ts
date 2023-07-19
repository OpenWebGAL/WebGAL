export function setLogo(logoName: string, url: string) {
  const logoImage = document.getElementById('logoImage');
  if (logoImage) {
    logoImage.style.backgroundImage = `url("${url}")`;
  }
}
