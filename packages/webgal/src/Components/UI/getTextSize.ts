export function getTextSize(size: number) {
  switch (size) {
    case 0:
      return 150;
    case 1:
      return 205;
    case 2:
      return 280;
    default:
      return 205;
  }
}
