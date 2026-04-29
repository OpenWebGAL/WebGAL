export function tryToRegex(str: string, flag: string | null): RegExp | false {
  try {
    return new RegExp(str, flag || '');
  } catch (e) {
    return false;
  }
}
