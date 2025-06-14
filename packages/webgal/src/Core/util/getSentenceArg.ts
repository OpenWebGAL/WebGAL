import { ISentence } from '@/Core/controller/scene/sceneInterface';

function getSentenceArgByKey_internal(sentence: ISentence, argKey: string): null | string | boolean | number {
  const args = sentence.args;
  const result = args.find((arg) => arg.key === argKey);
  if (result) {
    return result.value;
  } else return null;
}

export function getNumberArgByKey(sentence: ISentence, argKey: string): number | null {
  const rawValue = getSentenceArgByKey_internal(sentence, argKey);
  if (typeof rawValue === "number") return isNaN(rawValue) ? null : rawValue;
  if (typeof rawValue === "boolean") return rawValue ? 1 : 0;
  if (typeof rawValue === "string") {
    const num = Number(rawValue.trim());
    return isNaN(num) ? null : num;
  }
  return null;
}

export function getBooleanArgByKey(sentence: ISentence, argKey: string): boolean | null {
  const rawValue = getSentenceArgByKey_internal(sentence, argKey);
  if (typeof rawValue === "boolean") return rawValue;
  if (typeof rawValue === "string") {
    const normalized = rawValue.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off"].includes(normalized)) return false;
  }
  if (typeof rawValue === "number") return rawValue !== 0;
  return null;
}

export function getStringArgByKey(sentence: ISentence, argKey: string): string | null {
  const rawValue = getSentenceArgByKey_internal(sentence, argKey);
  if (rawValue === null || rawValue === undefined) return null;
  return rawValue.toString();
}
