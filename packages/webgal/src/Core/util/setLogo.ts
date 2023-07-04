export function setLogo(logoName :string , url: string ) {
  const logo1 = document.getElementById('logo1');
  const logo2 = document.getElementById('logo2');
  const logo3 = document.getElementById('logo3');
  if (logoName == "logo1" && logo1) {
    logo1.style.backgroundImage = `url("${url}")`;
  }
  if (logoName == "logo2" && logo2) {
    logo2.style.backgroundImage = `url("${url}")`;
  }
  if (logoName == "logo3" && logo3) {
    logo3.style.backgroundImage = `url("${url}")`;
  }
}
