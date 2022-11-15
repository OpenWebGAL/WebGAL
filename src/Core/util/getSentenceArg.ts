import { ISentence } from '@/Core/controller/scene/sceneInterface';

export function getSentenceArgByKey(sentnece: ISentence, argk: string): null | string | boolean | number {
  const args = sentnece.args;
  const result = args.find((arg) => arg.key === argk);
  if (result) {
    return result.value;
  } else return null;
}
