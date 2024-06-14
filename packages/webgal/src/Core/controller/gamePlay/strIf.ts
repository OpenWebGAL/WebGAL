import { compile } from 'angular-expressions';

export function strIf(s: string) {
  try {
    const res = compile(s);
    return res();
  } catch {
    return false;
  }
}
