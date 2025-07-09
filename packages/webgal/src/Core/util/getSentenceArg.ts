import { ISentence } from '@/Core/controller/scene/sceneInterface';

export function getSentenceArgByKey(sentnece: ISentence, argk: string): null | string | boolean | number {
  const args = sentnece.args;
  const result = args.find((arg) => arg.key === argk);
  if (result) {
    return result.value;
  } else return null;
}

export function getSentenceSpecialValue(
  sentence: ISentence,
  argk: string,
  nestedKey?: string,
): null | string | boolean | number | Object {
  const args = sentence.args;
  const result = args.find((arg) => arg.key === argk);

  if (result) {
    if (nestedKey && (result as any)[nestedKey]) {
      return (result as any)[nestedKey];
    }
    return null;
  } else {
    return null;
  }
}
