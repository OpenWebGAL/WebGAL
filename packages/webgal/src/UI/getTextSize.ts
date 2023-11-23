export function getTextSize(size: number) {
  switch (size) {
    case 0:
      return 150;
    case 1:
      return 205;
    case 2:
      return 240;
    default:
      return 205;
  }
}
